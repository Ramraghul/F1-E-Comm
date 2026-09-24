import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/apiBaseQuery';
import type { ApiEnvelope } from '../../app/apiTypes';
import type { AdminOverviewAnalytics, SalesByTeam, UserDTO } from '@shopswift/shared';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PendingRaceTeams'],
  endpoints: (builder) => ({
    getOverview: builder.query<ApiEnvelope<AdminOverviewAnalytics>, void>({
      query: () => '/admin/analytics/overview',
    }),
    getSalesByTeam: builder.query<ApiEnvelope<SalesByTeam[]>, void>({
      query: () => '/admin/analytics/sales-by-team',
    }),
    listPendingRaceTeams: builder.query<ApiEnvelope<UserDTO[]>, void>({
      query: () => '/admin/raceteams/pending',
      providesTags: [{ type: 'PendingRaceTeams', id: 'LIST' }],
    }),
    approveRaceTeam: builder.mutation<ApiEnvelope<UserDTO>, string>({
      query: (userId) => ({ url: `/admin/raceteams/${userId}/approve`, method: 'PATCH' }),
      invalidatesTags: [{ type: 'PendingRaceTeams', id: 'LIST' }],
    }),
    rejectRaceTeam: builder.mutation<ApiEnvelope<UserDTO>, string>({
      query: (userId) => ({ url: `/admin/raceteams/${userId}/reject`, method: 'PATCH' }),
      invalidatesTags: [{ type: 'PendingRaceTeams', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetOverviewQuery,
  useGetSalesByTeamQuery,
  useListPendingRaceTeamsQuery,
  useApproveRaceTeamMutation,
  useRejectRaceTeamMutation,
} = adminApi;
