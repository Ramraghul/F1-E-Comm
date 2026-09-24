import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/apiBaseQuery';
import type { ApiEnvelope } from '../../app/apiTypes';
import type { WishlistDTO } from '@shopswift/shared';

export const wishlistApi = createApi({
  reducerPath: 'wishlistApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Wishlist'],
  endpoints: (builder) => ({
    getWishlist: builder.query<ApiEnvelope<WishlistDTO>, void>({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
    }),
    addToWishlist: builder.mutation<ApiEnvelope<WishlistDTO>, string>({
      query: (productId) => ({ url: `/wishlist/${productId}`, method: 'POST' }),
      invalidatesTags: ['Wishlist'],
    }),
    removeFromWishlist: builder.mutation<ApiEnvelope<WishlistDTO>, string>({
      query: (productId) => ({ url: `/wishlist/${productId}`, method: 'DELETE' }),
      invalidatesTags: ['Wishlist'],
    }),
  }),
});

export const { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } = wishlistApi;
