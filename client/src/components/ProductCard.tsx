import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ProductDTO } from '@shopswift/shared';
import { formatMoney } from '../lib/format';
import { teamStyleVars } from '../lib/teamTheme';
import { WishlistButton } from './WishlistButton';

export function ProductCard({ product, onAddToCart }: { product: ProductDTO; onAddToCart?: () => void }) {
  const team = typeof product.team === 'object' ? product.team : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35 }}
      style={team ? teamStyleVars(team) : undefined}
      className="group card-surface relative flex flex-col overflow-hidden rounded-lg transition hover:-translate-y-1 hover:border-white/15"
    >
      <Link to={`/products/${product.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-base-800">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/20">No image</div>
          )}
          {product.isFeatured && (
            <span className="absolute left-2 top-2 rounded bg-team px-2 py-0.5 text-[10px] font-display font-bold uppercase tracking-wider text-white shadow-team-glow">
              Featured
            </span>
          )}
          <WishlistButton
            productId={product.id}
            productName={product.name}
            size="sm"
            className="absolute right-2 top-2 z-10 backdrop-blur-sm"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="rounded border border-white/30 px-3 py-1 font-display text-xs uppercase tracking-widest text-white">
                Sold Out
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-4">
          {team && (
            <span className="font-display text-[11px] font-semibold uppercase tracking-wider text-team">
              {team.name}
            </span>
          )}
          <h3 className="line-clamp-2 font-display text-base font-semibold text-white">{product.name}</h3>
          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="font-display text-lg font-bold text-white">{formatMoney(product.price)}</span>
            {product.ratingsCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-white/50">
                ★ {product.ratingsAverage.toFixed(1)}
                <span className="text-white/30">({product.ratingsCount})</span>
              </span>
            )}
          </div>
        </div>
      </Link>
      {onAddToCart && (
        <button
          type="button"
          onClick={onAddToCart}
          disabled={product.stock === 0}
          className="btn-team mx-4 mb-4 rounded-md py-2 text-xs disabled:opacity-40"
        >
          Add to Cart
        </button>
      )}
    </motion.div>
  );
}
