import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import type { ProductDTO } from '@shopswift/shared';

jest.mock('../features/wishlist/useWishlist', () => ({
  useWishlist: () => ({ isWishlisted: () => false, toggle: jest.fn(), isMutating: false }),
}));

const product: ProductDTO = {
  id: 'prod-1',
  team: { id: 'team-1', name: 'Test Racing', slug: 'test-racing', colorPrimary: '#E10600' },
  name: 'Team Racing Cap',
  slug: 'team-racing-cap',
  description: 'A cap.',
  category: 'headwear',
  price: 3499,
  currency: 'USD',
  stock: 10,
  sku: 'CAP-1',
  images: ['https://example.com/cap.jpg'],
  isFeatured: false,
  isActive: true,
  ratingsAverage: 4.5,
  ratingsCount: 12,
  createdBy: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function renderCard(onAddToCart?: () => void) {
  return render(
    <MemoryRouter>
      <ProductCard product={product} onAddToCart={onAddToCart} />
    </MemoryRouter>,
  );
}

describe('ProductCard', () => {
  it('renders the product name, team name and formatted price', () => {
    renderCard();
    expect(screen.getByText('Team Racing Cap')).toBeInTheDocument();
    expect(screen.getByText('Test Racing')).toBeInTheDocument();
    expect(screen.getByText('$34.99')).toBeInTheDocument();
  });

  it('calls onAddToCart when the Add to Cart button is clicked', () => {
    const onAddToCart = jest.fn();
    renderCard(onAddToCart);
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(onAddToCart).toHaveBeenCalledTimes(1);
  });

  it('disables the Add to Cart button and shows "Sold Out" when stock is 0', () => {
    render(
      <MemoryRouter>
        <ProductCard product={{ ...product, stock: 0 }} onAddToCart={jest.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeDisabled();
    expect(screen.getByText('Sold Out')).toBeInTheDocument();
  });
});
