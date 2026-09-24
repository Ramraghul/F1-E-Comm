import { faker } from '@faker-js/faker';
import { ROLES } from '@shopswift/shared';
import { User, type IUser } from '../../models/User.model';

const DEFAULT_PASSWORD = 'Passw0rd!';

export async function createUser(overrides: Partial<Record<string, unknown>> = {}): Promise<IUser> {
  return User.create({
    name: faker.person.fullName(),
    email: (overrides.email as string) ?? faker.internet.email().toLowerCase(),
    password: DEFAULT_PASSWORD,
    role: ROLES.USER,
    ...overrides,
  });
}

export async function createAdmin(overrides: Partial<Record<string, unknown>> = {}): Promise<IUser> {
  return createUser({ role: ROLES.ADMIN, ...overrides });
}

export async function createRaceTeamUser(
  teamId: string,
  overrides: Partial<Record<string, unknown>> = {},
): Promise<IUser> {
  const { isApproved = true, ...rest } = overrides;

  // The model always forces a *new* raceteam doc to isApproved:false (mirrors the
  // real self-registration flow), so approval has to be a separate follow-up save —
  // exactly like an admin calling PATCH /admin/raceteams/:id/approve.
  const user = await User.create({
    name: faker.person.fullName(),
    email: (rest.email as string) ?? faker.internet.email().toLowerCase(),
    password: DEFAULT_PASSWORD,
    role: ROLES.RACETEAM,
    team: teamId,
    ...rest,
  });

  user.isApproved = isApproved as boolean;
  await user.save();
  return user;
}

export { DEFAULT_PASSWORD };
