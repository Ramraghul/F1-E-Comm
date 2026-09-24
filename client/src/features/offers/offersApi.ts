import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/apiBaseQuery';
import type { ApiEnvelope } from '../../app/apiTypes';
import type { CreateOfferInput, OfferDTO, OfferValidationResult, UpdateOfferInput } from '@shopswift/shared';

export const offersApi = createApi({
  reducerPath: 'offersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Offer', 'MyOffers'],
  endpoints: (builder) => ({
    listActiveOffers: builder.query<ApiEnvelope<OfferDTO[]>, void>({
      query: () => '/offers',
      providesTags: [{ type: 'Offer', id: 'ACTIVE' }],
    }),
    listActiveOffersForTeam: builder.query<ApiEnvelope<OfferDTO[]>, string>({
      query: (teamSlug) => `/offers/team/${teamSlug}`,
      providesTags: (_r, _e, teamSlug) => [{ type: 'Offer', id: `TEAM-${teamSlug}` }],
    }),
    validateOffer: builder.mutation<ApiEnvelope<OfferValidationResult>, { code: string }>({
      query: (body) => ({ url: '/offers/validate', method: 'POST', body }),
    }),
    listMyOffers: builder.query<ApiEnvelope<OfferDTO[]>, void>({
      query: () => '/offers/mine',
      providesTags: [{ type: 'MyOffers', id: 'LIST' }],
    }),
    listAllOffers: builder.query<ApiEnvelope<OfferDTO[]>, void>({
      query: () => '/offers/all',
      providesTags: [{ type: 'Offer', id: 'ALL' }],
    }),
    createOffer: builder.mutation<ApiEnvelope<OfferDTO>, CreateOfferInput>({
      query: (body) => ({ url: '/offers', method: 'POST', body }),
      invalidatesTags: [
        { type: 'MyOffers', id: 'LIST' },
        { type: 'Offer', id: 'ALL' },
        { type: 'Offer', id: 'ACTIVE' },
      ],
    }),
    updateOffer: builder.mutation<ApiEnvelope<OfferDTO>, { id: string; body: UpdateOfferInput }>({
      query: ({ id, body }) => ({ url: `/offers/${id}`, method: 'PATCH', body }),
      invalidatesTags: [
        { type: 'MyOffers', id: 'LIST' },
        { type: 'Offer', id: 'ALL' },
        { type: 'Offer', id: 'ACTIVE' },
      ],
    }),
    deleteOffer: builder.mutation<ApiEnvelope<null>, string>({
      query: (id) => ({ url: `/offers/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'MyOffers', id: 'LIST' },
        { type: 'Offer', id: 'ALL' },
        { type: 'Offer', id: 'ACTIVE' },
      ],
    }),
  }),
});

export const {
  useListActiveOffersQuery,
  useListActiveOffersForTeamQuery,
  useValidateOfferMutation,
  useListMyOffersQuery,
  useListAllOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} = offersApi;
