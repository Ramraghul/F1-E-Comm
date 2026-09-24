import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/apiBaseQuery';
import type { ApiEnvelope, PaginatedEnvelope } from '../../app/apiTypes';
import type { CreateOrderInput, OrderDTO } from '@shopswift/shared';

interface CreateOrderResponse {
  order: OrderDTO;
  clientSecret: string;
}

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    createOrder: builder.mutation<ApiEnvelope<CreateOrderResponse>, CreateOrderInput>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: [{ type: 'Order', id: 'MINE' }],
    }),
    listMyOrders: builder.query<PaginatedEnvelope<OrderDTO>, { page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/orders/mine', params: params ?? undefined }),
      providesTags: [{ type: 'Order', id: 'MINE' }],
    }),
    getOrder: builder.query<ApiEnvelope<OrderDTO>, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),
    cancelOrder: builder.mutation<ApiEnvelope<OrderDTO>, string>({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Order', id }, { type: 'Order', id: 'MINE' }],
    }),
    listAllOrders: builder.query<
      PaginatedEnvelope<OrderDTO>,
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => ({ url: '/orders', params: params ?? undefined }),
      providesTags: [{ type: 'Order', id: 'ALL' }],
    }),
    listTeamOrders: builder.query<PaginatedEnvelope<OrderDTO>, { page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/orders/team', params: params ?? undefined }),
      providesTags: [{ type: 'Order', id: 'TEAM' }],
    }),
    updateOrderStatus: builder.mutation<ApiEnvelope<OrderDTO>, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/orders/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'ALL' },
        { type: 'Order', id: 'TEAM' },
      ],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useListMyOrdersQuery,
  useGetOrderQuery,
  useCancelOrderMutation,
  useListAllOrdersQuery,
  useListTeamOrdersQuery,
  useUpdateOrderStatusMutation,
} = ordersApi;
