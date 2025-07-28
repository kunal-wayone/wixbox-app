import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ToastAndroid } from 'react-native';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  shop_id: string | undefined;
  tax: string | undefined; // tax in percentage as string, e.g. "5" for 5%
}

interface CartState {
  items: CartItem[];
  totalAmount: number;    // Subtotal without tax
  totalTax: number;       // Total tax amount
  totalWithTax: number;   // Grand total (subtotal + tax)
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  totalTax: 0,
  totalWithTax: 0,
};

const calculateTaxAmount = (price: number, quantity: number, taxStr?: string) => {
  const taxRate = taxStr ? parseFloat(taxStr) : 0;
  const subtotal = price * quantity;
  return (subtotal * taxRate) / 100;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, shop_id, price, quantity, name, image, tax } = action.payload;
      console.log(id, shop_id, price, quantity, name, image, tax,"djfksd")
      const cartHasItems = state.items.length > 0;
      const isDifferentShop = cartHasItems && state.items[0].shop_id !== shop_id;

      if (isDifferentShop) {
        ToastAndroid.show(
          'You can only add items from one shop at a time.',
          ToastAndroid.SHORT
        );
        return;
      }

      const existingItemIndex = state.items.findIndex(item => item.id === id);
      const itemTax = calculateTaxAmount(price, quantity, tax?.rate);

      if (existingItemIndex > -1) {
        state.items[existingItemIndex].quantity += quantity;
      } else {
        state.items.push(action.payload);
        ToastAndroid.show(`${name} added to cart.`, ToastAndroid.SHORT);
      }

      state.totalAmount += price * quantity;
      state.totalTax += itemTax;
      state.totalWithTax = state.totalAmount + state.totalTax;
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      const index = state.items.findIndex(item => item.id === action.payload);
      if (index > -1) {
        const item = state.items[index];
        const itemSubtotal = item.price * item.quantity;
        const itemTax = calculateTaxAmount(item.price, item.quantity, item.tax?.rate);

        state.totalAmount -= itemSubtotal;
        state.totalTax -= itemTax;
        state.totalWithTax = state.totalAmount + state.totalTax;

        state.items.splice(index, 1);

        ToastAndroid.show(`${item.name} removed from cart.`, ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Item not found in cart.', ToastAndroid.SHORT);
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
      state.totalTax = 0;
      state.totalWithTax = 0;
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
