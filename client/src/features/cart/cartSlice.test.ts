import reducer, { itemAdded, quantityUpdated, itemRemoved, cartCleared } from './cartSlice';
import type { LocalCartItem } from '@shopswift/shared';

const baseItem: Omit<LocalCartItem, 'quantity'> = {
  productId: 'p1',
  name: 'Team Cap',
  image: 'https://example.com/cap.jpg',
  price: 3499,
  stock: 5,
  team: { id: 't1', slug: 'test-team', name: 'Test Team' },
};

beforeEach(() => {
  localStorage.clear();
});

describe('cartSlice', () => {
  it('adds a new item with the given quantity', () => {
    const state = reducer({ items: [] }, itemAdded({ item: baseItem, quantity: 2 }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({ productId: 'p1', quantity: 2 });
  });

  it('increments quantity instead of duplicating a line when the same product is added again', () => {
    let state = reducer({ items: [] }, itemAdded({ item: baseItem, quantity: 1 }));
    state = reducer(state, itemAdded({ item: baseItem, quantity: 2 }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0]?.quantity).toBe(3);
  });

  it('clamps quantity to the available stock when adding', () => {
    const state = reducer({ items: [] }, itemAdded({ item: baseItem, quantity: 99 }));
    expect(state.items[0]?.quantity).toBe(baseItem.stock);
  });

  it('quantityUpdated clamps between 1 and stock', () => {
    let state = reducer({ items: [] }, itemAdded({ item: baseItem, quantity: 1 }));
    state = reducer(state, quantityUpdated({ productId: 'p1', quantity: 999 }));
    expect(state.items[0]?.quantity).toBe(baseItem.stock);

    state = reducer(state, quantityUpdated({ productId: 'p1', quantity: 0 }));
    expect(state.items[0]?.quantity).toBe(1);
  });

  it('removes the line entirely on itemRemoved', () => {
    let state = reducer({ items: [] }, itemAdded({ item: baseItem, quantity: 1 }));
    state = reducer(state, itemRemoved('p1'));
    expect(state.items).toHaveLength(0);
  });

  it('cartCleared empties all items', () => {
    let state = reducer({ items: [] }, itemAdded({ item: baseItem, quantity: 1 }));
    state = reducer(state, cartCleared());
    expect(state.items).toHaveLength(0);
  });

  it('persists the updated cart to localStorage on every mutation', () => {
    reducer({ items: [] }, itemAdded({ item: baseItem, quantity: 1 }));
    const stored = JSON.parse(localStorage.getItem('shopswift_guest_cart') ?? '[]');
    expect(stored).toMatchObject([{ productId: 'p1', quantity: 1 }]);
  });
});
