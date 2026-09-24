import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/apiBaseQuery';
import type { ApiEnvelope } from '../../app/apiTypes';
import type { CreateReviewInput, ReviewDTO } from '@shopswift/shared';

export const reviewsApi = createApi({
  reducerPath: 'reviewsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Review'],
  endpoints: (builder) => ({
    listReviews: builder.query<ApiEnvelope<ReviewDTO[]>, string>({
      query: (productId) => `/products/${productId}/reviews`,
      providesTags: (_r, _e, productId) => [{ type: 'Review', id: productId }],
    }),
    createReview: builder.mutation<ApiEnvelope<ReviewDTO>, { productId: string; body: CreateReviewInput }>({
      query: ({ productId, body }) => ({
        url: `/products/${productId}/reviews`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: 'Review', id: productId }],
    }),
    deleteReview: builder.mutation<ApiEnvelope<null>, { id: string; productId: string }>({
      query: ({ id }) => ({ url: `/reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: 'Review', id: productId }],
    }),
  }),
});

export const { useListReviewsQuery, useCreateReviewMutation, useDeleteReviewMutation } = reviewsApi;
