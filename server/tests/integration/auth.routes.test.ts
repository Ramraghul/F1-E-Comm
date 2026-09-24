import request from 'supertest';
import { app } from '../utils/testApp';
import { User } from '../../src/models/User.model';
import { createTeam, createRaceTeamUser } from '../../src/seed/factories';

const REGISTER_URL = '/api/v1/auth/register';
const LOGIN_URL = '/api/v1/auth/login';
const REFRESH_URL = '/api/v1/auth/refresh';

function extractRefreshCookie(res: request.Response): string {
  const cookies = res.headers['set-cookie'] as unknown as string[] | undefined;
  const cookie = cookies?.find((c) => c.startsWith('shopswift_refresh_token='));
  if (!cookie) throw new Error('No refresh cookie set on response');
  return cookie.split(';')[0]!;
}

describe('Auth', () => {
  describe('POST /auth/register', () => {
    it('creates a user with a hashed (not plaintext) password', async () => {
      const res = await request(app).post(REGISTER_URL).send({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'Passw0rd!',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.user.email).toBe('ada@example.com');
      expect(res.body.data.user.password).toBeUndefined();

      const stored = await User.findOne({ email: 'ada@example.com' }).select('+password');
      expect(stored!.password).not.toBe('Passw0rd!');
      expect(stored!.password.length).toBeGreaterThan(20);
    });

    it('rejects a duplicate email with 409', async () => {
      await request(app).post(REGISTER_URL).send({
        name: 'Ada',
        email: 'dupe@example.com',
        password: 'Passw0rd!',
      });
      const res = await request(app).post(REGISTER_URL).send({
        name: 'Ada 2',
        email: 'dupe@example.com',
        password: 'Passw0rd!',
      });
      expect(res.status).toBe(409);
    });

    it('rejects a weak password with a 400 validation error', async () => {
      const res = await request(app).post(REGISTER_URL).send({
        name: 'Weak Password',
        email: 'weak@example.com',
        password: 'weak',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/register/raceteam', () => {
    it('creates an unapproved raceteam account and blocks login until approved', async () => {
      const team = await createTeam({ name: 'Apex GP', slug: 'apex-gp' });

      const registerRes = await request(app).post('/api/v1/auth/register/raceteam').send({
        name: 'Apex Manager',
        email: 'apex@example.com',
        password: 'Passw0rd!',
        teamId: team.id,
      });
      expect(registerRes.status).toBe(201);
      expect(registerRes.body.data.user.isApproved).toBe(false);

      const loginRes = await request(app)
        .post(LOGIN_URL)
        .send({ email: 'apex@example.com', password: 'Passw0rd!' });
      expect(loginRes.status).toBe(403);
    });

    it('allows login once an admin approves the account', async () => {
      const team = await createTeam({ name: 'Vertex Racing', slug: 'vertex-racing' });
      const user = await createRaceTeamUser(team.id, {
        email: 'vertex@example.com',
        isApproved: true,
      });

      const loginRes = await request(app)
        .post(LOGIN_URL)
        .send({ email: 'vertex@example.com', password: 'Passw0rd!' });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.user.id).toBe(user.id);
    });
  });

  describe('POST /auth/login', () => {
    it('rejects an incorrect password with 401', async () => {
      await request(app).post(REGISTER_URL).send({
        name: 'Login Test',
        email: 'login@example.com',
        password: 'Passw0rd!',
      });
      const res = await request(app)
        .post(LOGIN_URL)
        .send({ email: 'login@example.com', password: 'WrongPassword1' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /auth/me', () => {
    it('returns 401 without an Authorization header', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('rotates the refresh token cookie and returns a usable access token', async () => {
      const registerRes = await request(app).post(REGISTER_URL).send({
        name: 'Refresh Test',
        email: 'refresh@example.com',
        password: 'Passw0rd!',
      });
      const firstCookie = extractRefreshCookie(registerRes);

      const refreshRes = await request(app).post(REFRESH_URL).set('Cookie', firstCookie);
      expect(refreshRes.status).toBe(200);

      // The refresh token cookie must rotate to a new value (the meaningful guarantee —
      // note the *access* token can legitimately be byte-identical to the previous one if
      // issued within the same second, since JWT signing is deterministic for identical
      // header+payload+secret, so that's not asserted here).
      const rotatedCookie = extractRefreshCookie(refreshRes);
      expect(rotatedCookie).not.toBe(firstCookie);

      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${refreshRes.body.data.tokens.accessToken}`);
      expect(meRes.status).toBe(200);
    });

    it('rejects a near-instant repeat of an already-rotated token without revoking the rest of the session', async () => {
      // Within the grace period, a repeat of an already-rotated token is treated as a
      // benign duplicate (e.g. two tabs open at once, or a retried request) rather than
      // theft — see REUSE_GRACE_PERIOD_MS in auth.service.ts. Only *that* call is
      // rejected; the token the legitimate rotation just issued must keep working.
      const registerRes = await request(app).post(REGISTER_URL).send({
        name: 'Reuse Fast Test',
        email: 'reuse-fast@example.com',
        password: 'Passw0rd!',
      });
      const originalCookie = extractRefreshCookie(registerRes);

      const firstRefreshRes = await request(app).post(REFRESH_URL).set('Cookie', originalCookie).expect(200);
      const rotatedCookie = extractRefreshCookie(firstRefreshRes);

      // Reusing the original cookie again, immediately, is rejected...
      const reuseRes = await request(app).post(REFRESH_URL).set('Cookie', originalCookie);
      expect(reuseRes.status).toBe(401);

      // ...but the token from the legitimate rotation above is untouched.
      const followUpRes = await request(app).post(REFRESH_URL).set('Cookie', rotatedCookie);
      expect(followUpRes.status).toBe(200);
    });

    it('treats a delayed reuse of an already-rotated token as theft and revokes every session', async () => {
      const registerRes = await request(app).post(REGISTER_URL).send({
        name: 'Reuse Delayed Test',
        email: 'reuse-delayed@example.com',
        password: 'Passw0rd!',
      });
      const originalCookie = extractRefreshCookie(registerRes);
      const userId = registerRes.body.data.user.id;

      const firstRefreshRes = await request(app).post(REFRESH_URL).set('Cookie', originalCookie).expect(200);
      const rotatedCookie = extractRefreshCookie(firstRefreshRes);

      // Simulate the rotation having happened well outside the grace period, rather than
      // asserting this with a real multi-second sleep in the test.
      await User.updateOne(
        { _id: userId },
        { $set: { 'refreshTokens.$[old].revokedAt': new Date(Date.now() - 60_000) } },
        { arrayFilters: [{ 'old.revokedAt': { $ne: null } }] },
      );

      const reuseRes = await request(app).post(REFRESH_URL).set('Cookie', originalCookie);
      expect(reuseRes.status).toBe(401);

      // Every session — including the one from the legitimate rotation — is now revoked.
      const followUpRes = await request(app).post(REFRESH_URL).set('Cookie', rotatedCookie);
      expect(followUpRes.status).toBe(401);
    });

    it('returns 401 when no refresh cookie is present', async () => {
      const res = await request(app).post(REFRESH_URL);
      expect(res.status).toBe(401);
    });

    it('handles two concurrent refreshes of the same token as a 200/401 pair, never a 500', async () => {
      // Regression test: two requests racing to rotate the same refresh token used to
      // both `doc.save()` the same User document, and the loser crashed with a Mongoose
      // VersionError (500) instead of a clean 401. This reproduces that exact race
      // (e.g. two browser tabs, or React StrictMode's dev-only double effect call).
      const registerRes = await request(app).post(REGISTER_URL).send({
        name: 'Race Test',
        email: 'race@example.com',
        password: 'Passw0rd!',
      });
      const cookie = extractRefreshCookie(registerRes);

      const [resA, resB] = await Promise.all([
        request(app).post(REFRESH_URL).set('Cookie', cookie),
        request(app).post(REFRESH_URL).set('Cookie', cookie),
      ]);

      const statuses = [resA.status, resB.status].sort();
      expect(statuses).toEqual([200, 401]);
    });
  });
});
