import { ROLES } from '@shopswift/shared';
import { User, type IUser } from '../models/User.model';
import { Team } from '../models/Team.model';
import { ApiError } from '../utils/ApiError';
import { sha256, randomToken } from '../utils/crypto';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type AccessTokenPayload,
} from './token.service';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterRaceTeamInput extends RegisterInput {
  teamId: string;
}

interface IssuedTokens {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

/**
 * How long after rotation a *repeat* presentation of the same (now-revoked) refresh
 * token is treated as a benign duplicate rather than theft. Real reuse-attack replays
 * happen well after the legitimate rotation; a near-instant repeat is far more likely
 * to be two requests racing on the same original token (two tabs opened at once, a
 * flaky network's automatic retry, etc). See `refresh()` below.
 */
const REUSE_GRACE_PERIOD_MS = 10_000;

function toAccessPayload(user: IUser): AccessTokenPayload {
  return {
    sub: user.id,
    role: user.role,
    team: user.team ? user.team.toString() : null,
  };
}

/**
 * Issues a new access/refresh pair and atomically appends the refresh token to the
 * user's `refreshTokens` array via `$push`/`$pull` query operators rather than
 * `doc.save()`. This is deliberate: `save()` uses Mongoose's optimistic-concurrency
 * version check, which throws a `VersionError` (surfaced as a 500) whenever two
 * requests race to save the same document — a real scenario here, since two tabs
 * (or React StrictMode's dev-only double effect) can call `/auth/refresh`
 * concurrently with the same cookie. Atomic operators have no such race.
 */
async function issueTokens(user: IUser, userAgent?: string): Promise<IssuedTokens> {
  const access = signAccessToken(toAccessPayload(user));
  const refresh = signRefreshToken(user.id);
  const now = new Date();

  await User.updateOne(
    { _id: user.id },
    {
      $push: {
        refreshTokens: {
          tokenHash: sha256(refresh.token),
          jti: refresh.jti,
          expiresAt: refresh.expiresAt,
          userAgent,
          createdAt: now,
          revokedAt: null,
        },
      },
    },
  );
  // Best-effort hygiene pass, independent of the push above (Mongo disallows both
  // $push and $pull on the same array path in a single update).
  await User.updateOne({ _id: user.id }, { $pull: { refreshTokens: { expiresAt: { $lte: now } } } });

  return {
    accessToken: access.token,
    accessTokenExpiresAt: access.expiresAt,
    refreshToken: refresh.token,
    refreshTokenExpiresAt: refresh.expiresAt,
  };
}

export async function register(input: RegisterInput, userAgent?: string) {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    role: ROLES.USER,
  });

  const tokens = await issueTokens(user, userAgent);
  return { user, tokens };
}

export async function registerRaceTeam(input: RegisterRaceTeamInput) {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const team = await Team.findById(input.teamId);
  if (!team || !team.isActive) throw ApiError.badRequest('Selected team is not available');

  const existingTeamOwner = await User.findOne({ team: team.id, role: ROLES.RACETEAM });
  if (existingTeamOwner) {
    throw ApiError.conflict('This team already has a Race Team account');
  }

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    role: ROLES.RACETEAM,
    team: team.id,
  });

  return user;
}

export async function login(email: string, password: string, userAgent?: string) {
  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password')
    .populate('team', 'name slug colorPrimary colorSecondary colorAccent logoUrl');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated');
  }
  if (user.role === ROLES.RACETEAM && !user.isApproved) {
    throw ApiError.forbidden('Your Race Team account is pending admin approval');
  }

  const tokens = await issueTokens(user, userAgent);
  return { user, tokens };
}

export async function refresh(refreshTokenCookie: string, userAgent?: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshTokenCookie);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const now = new Date();

  // Atomically revoke the presented token IFF it is not already revoked — this is
  // both the persistence step and the race-safe reuse check in one operation.
  // MongoDB applies this per-document update atomically, so if the same refresh
  // token is presented twice concurrently (two tabs, or a duplicate request),
  // only one call can match here; the other correctly falls into the reuse branch
  // below instead of both racing to `.save()` the same document (which previously
  // threw a Mongoose VersionError -> 500).
  const preImage = await User.findOneAndUpdate(
    { _id: payload.sub, refreshTokens: { $elemMatch: { jti: payload.jti, revokedAt: null } } },
    { $set: { 'refreshTokens.$.revokedAt': now } },
    { new: false },
  ).select('+refreshTokens');

  if (!preImage) {
    // Either this user/token doesn't exist at all, or it matched but was already
    // revoked. For the latter, check how long ago it was revoked before deciding how
    // seriously to treat it — a genuine theft replay happens well after the real
    // rotation, whereas a repeat within the grace window is far more likely to be a
    // second request that raced the first one on the same original token.
    const existingUser = await User.findById(payload.sub).select('+refreshTokens');
    const existingToken = existingUser?.refreshTokens.find((rt) => rt.jti === payload.jti);

    if (existingToken?.revokedAt && Date.now() - existingToken.revokedAt.getTime() < REUSE_GRACE_PERIOD_MS) {
      // Benign duplicate: reject only this call — the request that won the race
      // already rotated the session successfully, so there's nothing to revoke.
      throw ApiError.unauthorized('This refresh token was already used a moment ago');
    }

    if (existingUser) await User.updateOne({ _id: existingUser.id }, { $set: { refreshTokens: [] } });
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const stored = preImage.refreshTokens.find((rt) => rt.jti === payload.jti);
  if (!stored || stored.tokenHash !== sha256(refreshTokenCookie) || stored.expiresAt <= now) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const tokens = await issueTokens(preImage, userAgent);
  const user = await User.findById(payload.sub).populate(
    'team',
    'name slug colorPrimary colorSecondary colorAccent logoUrl',
  );
  if (!user) throw ApiError.unauthorized('Invalid refresh token');
  return { user, tokens };
}

export async function logout(userId: string, refreshTokenCookie?: string) {
  if (!refreshTokenCookie) return;

  try {
    const payload = verifyRefreshToken(refreshTokenCookie);
    await User.updateOne({ _id: userId }, { $pull: { refreshTokens: { jti: payload.jti } } });
  } catch {
    // ignore invalid token on logout
  }
}

export async function forgotPassword(email: string): Promise<string | null> {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return null;

  const rawToken = randomToken(32);
  user.passwordResetTokenHash = sha256(rawToken);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();
  return rawToken;
}

export async function resetPassword(rawToken: string, newPassword: string) {
  const tokenHash = sha256(rawToken);
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetTokenHash +passwordResetExpires +refreshTokens');

  if (!user) throw ApiError.badRequest('Password reset token is invalid or has expired');

  user.password = newPassword;
  user.passwordResetTokenHash = null;
  user.passwordResetExpires = null;
  user.refreshTokens = []; // force re-login everywhere
  await user.save();
}
