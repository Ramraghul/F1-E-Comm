import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PRODUCT_CATEGORIES } from '@shopswift/shared';
import { useListProductsQuery } from '../features/products/productsApi';
import { useListTeamsQuery } from '../features/teams/teamsApi';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useCartActions } from '../features/cart/useCartActions';

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [page, setPage] = useState(1);
  const { addItem } = useCartActions();
  const { data: teams } = useListTeamsQuery();

  const team = params.get('team') ?? undefined;
  const category = (params.get('category') as (typeof PRODUCT_CATEGORIES)[number]) || undefined;
  const sort = (params.get('sort') as 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'featured') || 'newest';

  const { data, isLoading, isFetching } = useListProductsQuery({
    team,
    category,
    sort,
    search: params.get('search') || undefined,
    page,
    limit: 12,
  });

  function updateParam(key: string, value: string | undefined) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">Shop All Products</h1>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateParam('search', search || undefined);
          }}
          className="flex w-full max-w-md gap-2"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="input-field"
          />
          <button type="submit" className="btn-outline px-4">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          <select
            value={team ?? ''}
            onChange={(e) => updateParam('team', e.target.value || undefined)}
            className="input-field w-auto"
          >
            <option value="">All Teams</option>
            {teams?.data.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={category ?? ''}
            onChange={(e) => updateParam('category', e.target.value || undefined)}
            className="input-field w-auto"
          >
            <option value="">All Categories</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace('-', ' ')}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="input-field w-auto"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="featured">Featured</option>
          </select>
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : !data || data.data.length === 0 ? (
          <EmptyState title="No products found" description="Try adjusting your filters." />
        ) : (
          <>
            <div className={`grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 ${isFetching ? 'opacity-60' : ''}`}>
              {data.data.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={() => addItem(product)} />
              ))}
            </div>

            {data.pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="btn-outline px-4 py-2 text-xs disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="px-3 text-sm text-white/50">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-outline px-4 py-2 text-xs disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
