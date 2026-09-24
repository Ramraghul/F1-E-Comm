import { Link } from 'react-router-dom';
import { useWishlist } from '../features/wishlist/useWishlist';
import { useCartActions } from '../features/cart/useCartActions';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { PageSpinner } from '../components/Spinner';
import type { ProductDTO } from '@shopswift/shared';

export default function WishlistPage() {
  const { items, isLoading } = useWishlist();
  const { addItem } = useCartActions();

  if (isLoading) return <PageSpinner />;

  const products = items
    .map((i) => i.product)
    .filter((p): p is ProductDTO => typeof p === 'object');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">My Wishlist</h1>
      <p className="mt-1 text-white/50">Products you&apos;ve saved for later.</p>

      {products.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Tap the heart icon on any product to save it here."
          action={
            <Link to="/products" className="btn-primary mt-4">
              Browse Products
            </Link>
          }
        />
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={() => addItem(product)} />
          ))}
        </div>
      )}
    </div>
  );
}
