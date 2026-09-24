import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import type { UserDTO } from '@shopswift/shared';

/**
 * A minimal store containing only the `auth` slice — enough for `useAuth()` /
 * route guards — without pulling in the full app store (and therefore every
 * RTK Query api module, which reads `import.meta.env` and isn't safe under
 * ts-jest's CommonJS transform).
 */
export function createAuthTestStore(authState?: {
  user: UserDTO | null;
  accessToken: string | null;
  status: 'checking' | 'authenticated' | 'unauthenticated';
}) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: authState ? { auth: authState } : undefined,
  });
}

export function mockUser(overrides: Partial<UserDTO> = {}): UserDTO {
  return {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    isApproved: true,
    isActive: true,
    addresses: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
