export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  RACETEAM: 'raceteam',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Tuple form (for zod's `z.enum(...)`, which requires a non-empty tuple, not `Role[]`). */
export const ROLE_VALUES = [ROLES.USER, ROLES.ADMIN, ROLES.RACETEAM] as const satisfies readonly Role[];

export const ALL_ROLES: Role[] = Object.values(ROLES);
