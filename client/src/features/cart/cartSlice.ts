import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LocalCartItem } from '@shopswift/shared';

const STORAGE_KEY = 'shopswift_guest_cart';

interface CartState {
  items: LocalCartItem[];
}

function loadFromStorage(): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalCartItem[]) : [];
  } catch {
    return [];
  }
}

function persist(items: LocalCartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // best-effort only — private browsing / storage-full failures are non-fatal
  }
}

const initialState: CartState = { items: loadFromStorage() };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    itemAdded: (state, action: PayloadAction<{ item: Omit<LocalCartItem, 'quantity'>; quantity?: number }>) => {
      const { item, quantity = 1 } = action.payload;
      const existing = state.items.find((i) => i.productId === item.productId);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, item.stock);
      } else {
        state.items.push({ ...item, quantity: Math.min(quantity, item.stock) });
      }
      persist(state.items);
    },
    quantityUpdated: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) item.quantity = Math.max(1, Math.min(action.payload.quantity, item.stock));
      persist(state.items);
    },
    itemRemoved: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      persist(state.items);
    },
    cartCleared: (state) => {
      state.items = [];
      persist(state.items);
    },
  },
});

export const { itemAdded, quantityUpdated, itemRemoved, cartCleared } = cartSlice.actions;
export default cartSlice.reducer;

export const selectGuestCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectGuestCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectGuestCartSubtotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
