import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UiState {
  cartDrawerOpen: boolean;
  toasts: Toast[];
}

const initialState: UiState = {
  cartDrawerOpen: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    cartDrawerOpened: (state) => {
      state.cartDrawerOpen = true;
    },
    cartDrawerClosed: (state) => {
      state.cartDrawerOpen = false;
    },
    toastAdded: {
      reducer: (state, action: PayloadAction<Toast>) => {
        state.toasts.push(action.payload);
      },
      prepare: (message: string, type: Toast['type'] = 'info') => ({
        payload: { id: crypto.randomUUID(), type, message },
      }),
    },
    toastDismissed: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { cartDrawerOpened, cartDrawerClosed, toastAdded, toastDismissed } = uiSlice.actions;
export default uiSlice.reducer;
