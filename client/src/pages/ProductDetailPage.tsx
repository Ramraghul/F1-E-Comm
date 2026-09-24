import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetProductQuery } from '../features/products/productsApi';
import { useListReviewsQuery, useCreateReviewMutation, useDeleteReviewMutation } from '../features/reviews/reviewsApi';
import { useCartActions } from '../features/cart/useCartActions';
import { useAuth } from '../features/auth/useAuth';
import { useToast, apiErrorMessage } from '../features/ui/useToast';
import { PageSpinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { StarRating } from '../components/StarRating';
import { WishlistButton } from '../components/WishlistButton';
import { formatDate, formatMoney } from '../lib/format';
import { teamStyleVars } from '../lib/teamTheme';

export default function ProductDetailPage() {
  const { id = '' } = useParams();
  const { data, isLoading } = useGetProductQuery(id);
  const { data: reviewsRes } = useListReviewsQuery(id, { skip: !id });
  const { addItem } = useCartActions();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [createReview, { isLoading: submittingReview }] = useCreateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  if (isLoading) return <PageSpinner />;
  const product = data?.data;
  if (!product) return <EmptyState title="Product not found" />;

  const team = typeof product.team === 'object' ? product.team : null;
  const reviews = reviewsRes?.data ?? [];
  const myReview = reviews.find((r) => typeof r.user === 'object' && r.user.id === user?.id);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createReview({ productId: id, body: { rating, comment } }).unwrap();
      setComment('');
      setRating(5);
      toast('Review submitted', 'success');
    } catch (err) {
      toast(apiErrorMessage(err, 'Could not submit review'), 'error');
    }
  }

  return (
    <div style={team ? teamStyleVars(team) : undefined} className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-lg bg-base-800">
            {product.images[activeImage] && (
              <img src={product.images[activeImage]} alt={product.name} className="h-full w-full object-cover" />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded border-2 ${
                    i === activeImage ? 'border-team' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {team && <p className="font-display text-sm font-bold uppercase tracking-wider text-team">{team.name}</p>}
          <h1 className="mt-1 font-display text-3xl font-bold text-white">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <StarRating value={Math.round(product.ratingsAverage)} readOnly size="text-sm" />
            <span className="text-sm text-white/40">
              {product.ratingsAverage.toFixed(1)} ({product.ratingsCount} reviews)
            </span>
          </div>
          <p className="mt-5 font-display text-3xl font-bold text-white">{formatMoney(product.price)}</p>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/60">{product.description}</p>

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-5">
              <p className="label">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span key={size} className="rounded border border-white/15 px-3 py-1.5 text-sm text-white/80">
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-md border border-white/15">
              <button
                type="button"
                className="px-3 py-2 text-white/70 hover:text-white"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="w-8 text-center text-white">{quantity}</span>
              <button
                type="button"
                className="px-3 py-2 text-white/70 hover:text-white disabled:opacity-30"
                disabled={quantity >= product.stock}
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              >
                +
              </button>
            </div>
            <button
              type="button"
              disabled={product.stock === 0}
              onClick={() => addItem(product, quantity)}
              className="btn-team flex-1 disabled:opacity-40"
            >
              {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
            <WishlistButton productId={product.id} productName={product.name} />
          </div>
          <p className="mt-2 text-xs text-white/40">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'} · SKU {product.sku}
          </p>
        </div>
      </div>

      <div className="mt-16 max-w-2xl">
        <h2 className="font-display text-2xl font-bold text-white">Reviews</h2>

        {isAuthenticated && !myReview && (
          <form onSubmit={handleSubmitReview} className="card-surface mt-5 rounded-lg p-5">
            <p className="label">Your Rating</p>
            <StarRating value={rating} onChange={setRating} />
            <textarea
              required
              minLength={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts on this product…"
              className="input-field mt-3 min-h-24"
            />
            <button type="submit" disabled={submittingReview} className="btn-team mt-3 px-6 py-2 text-xs">
              {submittingReview ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        )}

        <ul className="mt-6 space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="card-surface rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StarRating value={review.rating} readOnly size="text-xs" />
                  {review.isVerifiedPurchase && (
                    <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <span className="text-xs text-white/30">{formatDate(review.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm text-white/70">{review.comment}</p>
              {typeof review.user === 'object' && (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-white/40">{review.user.name}</p>
                  {(review.user.id === user?.id || user?.role === 'admin') && (
                    <button
                      type="button"
                      onClick={() => deleteReview({ id: review.id, productId: id })}
                      className="text-xs text-white/30 hover:text-f1red-light"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
          {reviews.length === 0 && <p className="text-sm text-white/40">No reviews yet — be the first!</p>}
        </ul>
      </div>
    </div>
  );
}
