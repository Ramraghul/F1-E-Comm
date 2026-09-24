import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import uiReducer from '../features/ui/uiSlice';
import { authApi } from '../features/auth/authApi';
import { teamsApi } from '../features/teams/teamsApi';
import { productsApi } from '../features/products/productsApi';
import { cartApi } from '../features/cart/cartApi';
import { wishlistApi } from '../features/wishlist/wishlistApi';
import { offersApi } from '../features/offers/offersApi';
import { ordersApi } from '../features/orders/ordersApi';
import { reviewsApi } from '../features/reviews/reviewsApi';
import { adminApi } from '../features/admin/adminApi';
import { raceteamApi } from '../features/raceteam/raceteamApi';
import { usersApi } from '../features/users/usersApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    ui: uiReducer,
    [authApi.reducerPath]: authApi.reducer,
    [teamsApi.reducerPath]: teamsApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [wishlistApi.reducerPath]: wishlistApi.reducer,
    [offersApi.reducerPath]: offersApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [raceteamApi.reducerPath]: raceteamApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      teamsApi.middleware,
      productsApi.middleware,
      cartApi.middleware,
      wishlistApi.middleware,
      offersApi.middleware,
      ordersApi.middleware,
      reviewsApi.middleware,
      adminApi.middleware,
      raceteamApi.middleware,
      usersApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
