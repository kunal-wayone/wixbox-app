import userReducer from './slices/userSlice';
import {configureStore} from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  devTools: __DEV__, // Only in development mode
  // Add middleware or dev tools if needed
});
