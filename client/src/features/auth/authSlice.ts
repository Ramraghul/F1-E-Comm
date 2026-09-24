import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserDTO } from '@shopswift/shared';

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: UserDTO | null;
  accessToken: string | null;
  status: AuthStatus;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: 'checking',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    credentialsSet: (state, action: PayloadAction<{ user: UserDTO; accessToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.status = 'authenticated';
    },
    credentialsUpdated: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.status = 'authenticated';
    },
    userUpdated: (state, action: PayloadAction<UserDTO>) => {
      state.user = action.payload;
    },
    sessionCheckFailed: (state) => {
      state.user = null;
      state.accessToken = null;
      state.status = 'unauthenticated';
    },
    loggedOut: (state) => {
      state.user = null;
      state.accessToken = null;
      state.status = 'unauthenticated';
    },
  },
});

export const { credentialsSet, credentialsUpdated, userUpdated, sessionCheckFailed, loggedOut } =
  authSlice.actions;
export default authSlice.reducer;
