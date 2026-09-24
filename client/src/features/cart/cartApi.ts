import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/apiBaseQuery';
import type { ApiEnvelope } from '../../app/apiTypes';
import type { CartDTO } from '@shopswift/shared';

export const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Cart'],
  endpoints: (builder) => ({
    getCart: builder.query<ApiEnvelope<CartDTO>, void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addCartItem: builder.mutation<ApiEnvelope<CartDTO>, { productId: string; quantity?: number }>({
      query: (body) => ({ url: '/cart/items', method: 'POST', body }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation<ApiEnvelope<CartDTO>, { productId: string; quantity: number }>({
      query: ({ productId, quantity }) => ({
        url: `/cart/items/${productId}`,
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: builder.mutation<ApiEnvelope<CartDTO>, string>({
      query: (productId) => ({ url: `/cart/items/${productId}`, method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation<ApiEnvelope<CartDTO>, void>({
      query: () => ({ url: '/cart', method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
    mergeGuestCart: builder.mutation<ApiEnvelope<CartDTO>, { items: { productId: string; quantity: number }[] }>({
      query: (body) => ({ url: '/cart/merge', method: 'POST', body }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useMergeGuestCartMutation,
} = cartApi;
