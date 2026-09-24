import type { Role } from '@shopswift/shared';

export interface AuthenticatedUser {
  id: string;
  role: Role;
  team?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      resource?: unknown;
    }
  }
}

export {};
