import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/apiBaseQuery';
import type { ApiEnvelope } from '../../app/apiTypes';
import type { RaceTeamAnalytics } from '@shopswift/shared';

export const raceteamApi = createApi({
  reducerPath: 'raceteamApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getMyTeamAnalytics: builder.query<ApiEnvelope<RaceTeamAnalytics>, void>({
      query: () => '/raceteam/analytics',
    }),
  }),
});

export const { useGetMyTeamAnalyticsQuery } = raceteamApi;
