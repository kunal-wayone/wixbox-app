import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface AddUserCartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface AddUserCartState {
  items: AddUserCartItem[];
  totalAmount: number;
  loading: boolean;
  error: string | null;
}

const initialState: AddUserCartState = {
  items: [],
  totalAmount: 0,
  loading: false,
  error: null,
};

// ✅ Submit cart to backend
export const submitAddUserCart = createAsyncThunk(
  'addUserCart/submitAddUserCart',
  async (
    {
      token,
      cartItems,
    }: {
      token: string;
      cartItems: AddUserCartItem[];
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/user/customer/cart',
        { order: cartItems },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit cart');
    }
  }
);

// ✅ Fetch cart from backend
export const fetchAddUserCart = createAsyncThunk(
  'addUserCart/fetchAddUserCart',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/user/customer/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      // Assuming response is { order: [...] }
      return response.data?.order || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

const addUserCartSlice = createSlice({
  name: 'addUserCart',
  initialState,
  reducers: {
    addAddUserCartItem: (state, action: PayloadAction<AddUserCartItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index].quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.totalAmount += action.payload.price * action.payload.quantity;
    },

    removeAddUserCartItem: (state, action: PayloadAction<number>) => {
      const index = state.items.findIndex(item => item.id === action.payload);
      if (index !== -1) {
        const item = state.items[index];
        state.totalAmount -= item.price * item.quantity;
        state.items.splice(index, 1);
      }
    },

    clearAddUserCart: state => {
      state.items = [];
      state.totalAmount = 0;
    },

    increaseAddUserCartItemQuantity: (state, action: PayloadAction<number>) => {
      const index = state.items.findIndex(item => item.id === action.payload);
      if (index !== -1) {
        state.items[index].quantity += 1;
        state.totalAmount += state.items[index].price;
      }
    },

    decreaseAddUserCartItemQuantity: (state, action: PayloadAction<number>) => {
      const index = state.items.findIndex(item => item.id === action.payload);
      if (index !== -1) {
        if (state.items[index].quantity > 1) {
          state.items[index].quantity -= 1;
          state.totalAmount -= state.items[index].price;
        } else {
          // Auto-remove item if quantity is 1 and user tries to decrease
          state.totalAmount -= state.items[index].price;
          state.items.splice(index, 1);
        }
      }
    },
  },

  extraReducers: builder => {
    builder
      .addCase(submitAddUserCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAddUserCart.fulfilled, state => {
        state.loading = false;
      })
      .addCase(submitAddUserCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchAddUserCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddUserCart.fulfilled, (state, action: PayloadAction<AddUserCartItem[]>) => {
        state.items = action.payload;
        state.totalAmount = action.payload.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        state.loading = false;
      })
      .addCase(fetchAddUserCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addAddUserCartItem,
  removeAddUserCartItem,
  clearAddUserCart,
  increaseAddUserCartItemQuantity,
  decreaseAddUserCartItemQuantity,
} = addUserCartSlice.actions;

export default addUserCartSlice.reducer;
