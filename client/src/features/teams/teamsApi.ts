import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/apiBaseQuery';
import type { ApiEnvelope } from '../../app/apiTypes';
import type { TeamDTO } from '@shopswift/shared';

export const teamsApi = createApi({
  reducerPath: 'teamsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Team'],
  endpoints: (builder) => ({
    listTeams: builder.query<ApiEnvelope<TeamDTO[]>, void>({
      query: () => '/teams',
      providesTags: (result) =>
        result
          ? [...result.data.map((t) => ({ type: 'Team' as const, id: t.id })), { type: 'Team', id: 'LIST' }]
          : [{ type: 'Team', id: 'LIST' }],
    }),
    getTeam: builder.query<ApiEnvelope<TeamDTO>, string>({
      query: (slug) => `/teams/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: 'Team', id: slug }],
    }),
    createTeam: builder.mutation<ApiEnvelope<TeamDTO>, Partial<TeamDTO>>({
      query: (body) => ({ url: '/teams', method: 'POST', body }),
      invalidatesTags: [{ type: 'Team', id: 'LIST' }],
    }),
    updateTeam: builder.mutation<ApiEnvelope<TeamDTO>, { id: string; body: Partial<TeamDTO> }>({
      query: ({ id, body }) => ({ url: `/teams/${id}`, method: 'PATCH', body }),
      invalidatesTags: [{ type: 'Team', id: 'LIST' }],
    }),
  }),
});

export const { useListTeamsQuery, useGetTeamQuery, useCreateTeamMutation, useUpdateTeamMutation } = teamsApi;
