import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/apiBaseQuery';
import type { ApiEnvelope, PaginatedEnvelope } from '../../app/apiTypes';
import type { CreateProductInput, ProductDTO, ProductQuery, UpdateProductInput } from '@shopswift/shared';

function toQueryString(query: ProductQuery = {}): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  return params.toString();
}

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    listProducts: builder.query<PaginatedEnvelope<ProductDTO>, ProductQuery | void>({
      query: (params) => `/products?${toQueryString(params ?? {})}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((p) => ({ type: 'Product' as const, id: p.id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getProduct: builder.query<ApiEnvelope<ProductDTO>, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation<ApiEnvelope<ProductDTO>, CreateProductInput>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    updateProduct: builder.mutation<ApiEnvelope<ProductDTO>, { id: string; body: UpdateProductInput }>({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }],
    }),
    deleteProduct: builder.mutation<ApiEnvelope<null>, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }],
    }),
    updateStock: builder.mutation<ApiEnvelope<ProductDTO>, { id: string; stock: number }>({
      query: ({ id, stock }) => ({ url: `/products/${id}/stock`, method: 'PATCH', body: { stock } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }],
    }),
  }),
});

export const {
  useListProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateStockMutation,
} = productsApi;
