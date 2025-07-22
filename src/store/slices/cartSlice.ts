// src/store/slices/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ToastAndroid } from 'react-native';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  shop_id: string | undefined;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // addToCart: (state, action: PayloadAction<CartItem>) => {
    //   const { id, shop_id, price, quantity, name, image } = action.payload;
    //   console.log(action.payload,state.items.length > 0 && state.items[0].shop_id !== shop_id)
    //   // Prevent adding items from different shops
    //   if (state.items.length > 0 && state.items[0].shop_id !== shop_id) {
    //     ToastAndroid.show(
    //       'Cart contains items from a different shop.',
    //       ToastAndroid.SHORT
    //     );
    //     return;
    //   }

    //   const existingItemIndex = state.items.findIndex(item => item.id === id);

    //   if (existingItemIndex > -1) {
    //     state.items[existingItemIndex].quantity += quantity;
    //     // ToastAndroid.show(
    //     //   `Updated quantity for ${name} in cart.`,
    //     //   ToastAndroid.SHORT
    //     // );
    //   } else {
    //     state.items.push(action.payload);
    //     ToastAndroid.show(
    //       `${name} added to cart.`,
    //       ToastAndroid.SHORT
    //     );
    //   }

    //   state.totalAmount += price * quantity;
    // },


    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, shop_id, price, quantity, name, image } = action.payload;

      const cartHasItems = state.items.length > 0;
      const isDifferentShop = cartHasItems && state.items[0].shop_id !== shop_id;

      // Prevent adding items from different shops
      if (isDifferentShop) {
        ToastAndroid.show(
          'You can only add items from one shop at a time.',
          ToastAndroid.SHORT
        );
        return; // Don't update the state
      }

      const existingItemIndex = state.items.findIndex(item => item.id === id);

      if (existingItemIndex > -1) {
        state.items[existingItemIndex].quantity += quantity;
        // Optional: show toast for quantity update
      } else {
        state.items.push(action.payload);
        ToastAndroid.show(`${name} added to cart.`, ToastAndroid.SHORT);
      }

      state.totalAmount += price * quantity;
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      const index = state.items.findIndex(item => item.id === action.payload);
      if (index > -1) {
        const item = state.items[index];
        state.totalAmount -= item.price * item.quantity;
        state.items.splice(index, 1);

        ToastAndroid.show(
          `${item.name} removed from cart.`,
          ToastAndroid.SHORT
        );
      } else {
        ToastAndroid.show(
          'Item not found in cart.',
          ToastAndroid.SHORT
        );
      }
    },

    clearCart: (state) => {
      if (state.items.length > 0) {
        ToastAndroid.show('Cart cleared.', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Cart is already empty.', ToastAndroid.SHORT);
      }

      state.items = [];
      state.totalAmount = 0;
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
