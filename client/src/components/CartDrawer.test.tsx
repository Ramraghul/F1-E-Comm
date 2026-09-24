import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartDrawer } from './CartDrawer';

jest.mock('../features/cart/useCartSummary', () => ({
  useCartSummary: () => ({ lines: [], subtotal: 0, isLoading: false }),
}));
jest.mock('../features/cart/useCartActions', () => ({
  useCartActions: () => ({ updateQuantity: jest.fn(), removeItem: jest.fn() }),
}));

function renderDrawer(open: boolean) {
  const onClose = jest.fn();
  render(
    <MemoryRouter>
      <CartDrawer open={open} onClose={onClose} />
    </MemoryRouter>,
  );
  return { onClose };
}

describe('CartDrawer', () => {
  // Regression coverage: this drawer previously used framer-motion's `animate` prop to
  // slide in/out, which got stuck mid-animation specifically when `open` flipped to
  // false at the same time as other state changes (e.g. a route navigation triggered
  // by clicking a link inside it). It now uses plain CSS transition classes instead —
  // these assertions pin down that the closed state is driven by a class the browser's
  // CSS engine applies unconditionally, not by a JS animation that can be interrupted.

  it('is translated off-screen and non-interactive when closed', () => {
    renderDrawer(false);
    const aside = document.querySelector('aside')!;
    expect(aside.className).toContain('translate-x-full');
    expect(aside.className).toContain('pointer-events-none');
    expect(aside).toHaveAttribute('aria-hidden', 'true');
  });

  it('is translated on-screen and interactive when open', () => {
    renderDrawer(true);
    const aside = document.querySelector('aside')!;
    expect(aside.className).toContain('translate-x-0');
    expect(aside.className).not.toContain('pointer-events-none');
    expect(aside).toHaveAttribute('aria-hidden', 'false');
  });

  it('is always mounted (present in the DOM) regardless of open state', () => {
    renderDrawer(false);
    expect(screen.getByText('Your Cart')).toBeInTheDocument();
  });
});
