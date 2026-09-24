import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useListTeamsQuery } from '../features/teams/teamsApi';
import { useListProductsQuery } from '../features/products/productsApi';
import { useListActiveOffersQuery } from '../features/offers/offersApi';
import { TeamBadge } from '../components/TeamBadge';
import { ProductCard } from '../components/ProductCard';
import { CountdownBanner } from '../components/CountdownBanner';
import { useCartActions } from '../features/cart/useCartActions';
import { Spinner } from '../components/Spinner';

export default function HomePage() {
  const { data: teams } = useListTeamsQuery();
  const { data: products, isLoading: productsLoading } = useListProductsQuery({
    sort: 'featured',
    limit: 8,
  });
  const { data: offers } = useListActiveOffersQuery();
  const { addItem } = useCartActions();

  const bannerOffer = offers?.data.find((o) => o.tag === 'flash-sale' || o.tag === 'race-weekend');

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-base-850 to-base-900">
        <div className="bg-grid-fade pointer-events-none absolute inset-0" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-sm font-bold uppercase tracking-[0.3em] text-f1red"
          >
            Lights Out. Gear Up.
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-3 max-w-2xl font-display text-5xl font-bold leading-[1.05] text-white sm:text-6xl"
          >
            Official Gear for <span className="text-gradient">Every Team</span> on the Grid
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 max-w-lg text-white/60"
          >
            Ten teams, one grid. Shop race-day apparel, scale model cars and collectibles — sold
            directly by each team&apos;s own store.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link to="/products" className="btn-primary">
              Shop All Products
            </Link>
            <Link to="/teams" className="btn-outline">
              Browse Teams
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-14 sm:px-6">
        {bannerOffer && <CountdownBanner offer={bannerOffer} />}

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-white">Teams</h2>
            <Link to="/teams" className="text-sm font-semibold text-white/50 hover:text-white">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {teams?.data.slice(0, 10).map((team) => <TeamBadge key={team.id} team={team} />)}
          </div>
        </section>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-white">Featured Products</h2>
            <Link to="/products" className="text-sm font-semibold text-white/50 hover:text-white">
              View all →
            </Link>
          </div>
          {productsLoading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {products?.data.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={() => addItem(product)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
