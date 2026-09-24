import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from './store';
import { credentialsUpdated, loggedOut } from '../features/auth/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  credentials: 'include', // send the httpOnly refresh cookie
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// Endpoints where a 401 means "bad credentials", not "expired access token" —
// retrying them via /auth/refresh would be pointless and noisy.
const NO_REAUTH_ENDPOINTS = new Set(['login', 'register', 'registerRaceTeam', 'refresh']);

let refreshPromise: Promise<FetchBaseQueryError | undefined> | null = null;

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && !NO_REAUTH_ENDPOINTS.has(api.endpoint)) {
    // Coalesce concurrent 401s into a single in-flight refresh call.
    refreshPromise ??= (async () => {
      const refreshResult = await rawBaseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions,
      );
      if (refreshResult.data) {
        const data = refreshResult.data as { data: { tokens: { accessToken: string } } };
        api.dispatch(credentialsUpdated({ accessToken: data.data.tokens.accessToken }));
        return undefined;
      }
      api.dispatch(loggedOut());
      return refreshResult.error;
    })().finally(() => {
      refreshPromise = null;
    });

    const refreshError = await refreshPromise;
    if (!refreshError) {
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};
