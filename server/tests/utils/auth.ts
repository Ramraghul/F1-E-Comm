import { signAccessToken } from '../../src/services/token.service';
import type { IUser } from '../../src/models/User.model';

/** Issues a real, valid access token for a seeded user, bypassing login/bcrypt for test speed. */
export function tokenFor(user: IUser): string {
  return signAccessToken({
    sub: user.id,
    role: user.role,
    team: user.team ? user.team.toString() : null,
  }).token;
}

export function bearer(user: IUser): string {
  return `Bearer ${tokenFor(user)}`;
}
