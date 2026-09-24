import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/apiBaseQuery';
import type { ApiEnvelope } from '../../app/apiTypes';
import type {
  AuthResponse,
  LoginInput,
  RegisterRaceTeamInput,
  RegisterUserInput,
  UserDTO,
} from '@shopswift/shared';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Me'],
  endpoints: (builder) => ({
    register: builder.mutation<ApiEnvelope<AuthResponse>, RegisterUserInput>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    registerRaceTeam: builder.mutation<ApiEnvelope<{ user: UserDTO }>, RegisterRaceTeamInput>({
      query: (body) => ({ url: '/auth/register/raceteam', method: 'POST', body }),
    }),
    login: builder.mutation<ApiEnvelope<AuthResponse>, LoginInput>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    refresh: builder.mutation<ApiEnvelope<AuthResponse>, void>({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    getMe: builder.query<ApiEnvelope<UserDTO>, void>({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),
    forgotPassword: builder.mutation<ApiEnvelope<null>, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<ApiEnvelope<null>, { token: string; password: string }>({
      query: ({ token, ...body }) => ({ url: `/auth/reset-password/${token}`, method: 'POST', body }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useRegisterRaceTeamMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
