// src/store/slices/customerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Fetch } from '../../utils/apiUtils';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  customers: [],
  loading: false,
  error: null,
};

export const fetchCustomers = createAsyncThunk(
  'customers/fetchAll',
  async (_, thunkAPI) => {
    try {
      const res = await Fetch<Customer[]>('/customers');
      return res;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch customers');
    }
  }
);

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearCustomers: state => {
      state.customers = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCustomers.pending, state => {
        state.loading = true;
      })
      .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<Customer[]>) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCustomers } = customerSlice.actions;
export default customerSlice.reducer;
