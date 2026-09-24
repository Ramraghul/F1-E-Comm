import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/apiBaseQuery';
import type { ApiEnvelope, PaginatedEnvelope } from '../../app/apiTypes';
import type { Address, UserDTO } from '@shopswift/shared';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Users'],
  endpoints: (builder) => ({
    updateMyProfile: builder.mutation<ApiEnvelope<UserDTO>, { name?: string; addresses?: Address[] }>({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
    updateMyPassword: builder.mutation<
      ApiEnvelope<null>,
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: '/users/me/password', method: 'PATCH', body }),
    }),
    listUsers: builder.query<PaginatedEnvelope<UserDTO>, { page?: number; limit?: number; role?: string } | void>({
      query: (params) => ({ url: '/users', params: params ?? undefined }),
      providesTags: [{ type: 'Users', id: 'LIST' }],
    }),
    adminUpdateUser: builder.mutation<
      ApiEnvelope<UserDTO>,
      { id: string; body: { role?: string; isActive?: boolean; isApproved?: boolean } }
    >({
      query: ({ id, body }) => ({ url: `/users/${id}`, method: 'PATCH', body }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),
    deleteUser: builder.mutation<ApiEnvelope<null>, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),
  }),
});

export const {
  useUpdateMyProfileMutation,
  useUpdateMyPasswordMutation,
  useListUsersQuery,
  useAdminUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
