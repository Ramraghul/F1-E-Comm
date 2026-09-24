import { useWishlist } from '../features/wishlist/useWishlist';

export function WishlistButton({
  productId,
  productName,
  size = 'md',
  className = '',
}: {
  productId: string;
  productName?: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const { isWishlisted, toggle, isMutating } = useWishlist();
  const active = isWishlisted(productId);
  const dimensions = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId, productName);
      }}
      disabled={isMutating}
      aria-pressed={active}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`flex ${dimensions} items-center justify-center rounded-full border transition ${
        active
          ? 'border-f1red/60 bg-f1red/15 text-f1red-light'
          : 'border-white/15 bg-black/30 text-white/70 hover:border-white/40 hover:text-white'
      } ${className}`}
    >
      <svg viewBox="0 0 24 24" className={iconSize} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8}>
        <path
          d="M12 20.5S3.5 15.36 3.5 9.36A4.86 4.86 0 0 1 8.36 4.5c1.69 0 3.19.86 4.14 2.16A5.02 5.02 0 0 1 16.14 4.5a4.86 4.86 0 0 1 4.86 4.86c0 6-8.5 11.14-8.5 11.14Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
