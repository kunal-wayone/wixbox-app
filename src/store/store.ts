// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import cartReducer from './slices/cartSlice';
import cartUserReducer from './slices/userCartSlice';
import wishListReduser from './slices/wishlistSlice';
import orederReduser from './slices/orderSlice';




export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    cart: cartReducer,
    userCart: cartUserReducer,
    wishlist: wishListReduser,
    order: orederReduser
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;