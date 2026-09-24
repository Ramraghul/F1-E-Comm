import { faker } from '@faker-js/faker';
import { Team, type ITeam } from '../../models/Team.model';
import { slugify } from '../../utils/slugify';

function randomHexColor(): string {
  return `#${faker.number.int({ min: 0, max: 0xffffff }).toString(16).padStart(6, '0')}`;
}

export async function createTeam(overrides: Partial<Record<string, unknown>> = {}): Promise<ITeam> {
  const name = (overrides.name as string) ?? `${faker.company.name()} Racing`;
  return Team.create({
    name,
    slug: (overrides.slug as string) ?? slugify(`${name}-${faker.string.alphanumeric(4)}`),
    nationality: faker.location.country(),
    colorPrimary: randomHexColor(),
    colorSecondary: randomHexColor(),
    colorAccent: randomHexColor(),
    foundedYear: faker.number.int({ min: 1950, max: 2020 }),
    principal: faker.person.fullName(),
    drivers: [],
    isActive: true,
    ...overrides,
  });
}
