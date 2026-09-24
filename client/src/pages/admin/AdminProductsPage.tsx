import { useState } from 'react';
import { useListProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation } from '../../features/products/productsApi';
import { useListTeamsQuery } from '../../features/teams/teamsApi';
import { PageSpinner } from '../../components/Spinner';
import { Modal } from '../../components/Modal';
import { ProductForm } from '../../components/ProductForm';
import { formatMoney } from '../../lib/format';
import { apiErrorMessage, useToast } from '../../features/ui/useToast';
import type { ProductDTO } from '@shopswift/shared';

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListProductsQuery({ page, limit: 15, sort: 'newest' });
  const { data: teams } = useListTeamsQuery();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [modalProduct, setModalProduct] = useState<ProductDTO | 'new' | null>(null);
  const toast = useToast();

  async function handleSubmit(values: Parameters<typeof createProduct>[0]) {
    try {
      if (modalProduct === 'new') {
        await createProduct(values).unwrap();
        toast('Product created', 'success');
      } else if (modalProduct) {
        await updateProduct({ id: modalProduct.id, body: values }).unwrap();
        toast('Product updated', 'success');
      }
      setModalProduct(null);
    } catch (err) {
      toast(apiErrorMessage(err, 'Could not save product'), 'error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this product?')) return;
    await deleteProduct(id).unwrap().catch((err) => toast(apiErrorMessage(err), 'error'));
  }

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">All Products</h1>
        <button type="button" onClick={() => setModalProduct('new')} className="btn-primary px-4 py-2 text-xs">
          + New Product
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/40">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data?.data.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3 font-medium text-white">{product.name}</td>
                <td className="px-4 py-3 text-white/60">
                  {typeof product.team === 'object' ? product.team.name : product.team}
                </td>
                <td className="px-4 py-3 text-white/60">{formatMoney(product.price)}</td>
                <td className="px-4 py-3 text-white/60">{product.stock}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => setModalProduct(product)} className="mr-3 text-xs text-white/50 hover:text-white">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(product.id)} className="text-xs text-f1red-light hover:underline">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline px-3 py-1.5 text-xs disabled:opacity-30">
            Prev
          </button>
          <span className="px-2 text-xs text-white/40">
            {data.pagination.page} / {data.pagination.totalPages}
          </span>
          <button disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-outline px-3 py-1.5 text-xs disabled:opacity-30">
            Next
          </button>
        </div>
      )}

      <Modal
        open={modalProduct !== null}
        onClose={() => setModalProduct(null)}
        title={modalProduct === 'new' ? 'New Product' : 'Edit Product'}
      >
        <ProductForm
          product={modalProduct !== 'new' ? (modalProduct ?? undefined) : undefined}
          teams={teams?.data}
          submitting={creating || updating}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
