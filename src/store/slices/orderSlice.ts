// src/store/slices/orderSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Fetch, Post, TokenStorage } from '../../utils/apiUtils';

interface Order {
  id: string;
  items: any[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (_, thunkAPI) => {
    try {
      const token = await TokenStorage.getToken();
      if (!token) throw new Error('Not authenticated');
      const res = await Fetch<Order[]>('/orders');
      return res;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData: any, thunkAPI) => {
    try {
      const res = await Post('/orders', orderData);
      return res;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to place order');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrders: state => {
      state.orders = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchOrders.pending, state => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
    //   .addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
    //     state.orders.unshift(action.payload);
    //   })
      .addCase(createOrder.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearOrders } = orderSlice.actions;
export default orderSlice.reducer;
