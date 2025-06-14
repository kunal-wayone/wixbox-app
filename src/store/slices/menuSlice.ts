// src/store/slices/menuSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Fetch } from '../../utils/apiUtils';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  available: boolean;
}

interface MenuState {
  items: MenuItem[];
  loading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchMenu = createAsyncThunk(
  'menu/fetchAll',
  async (_, thunkAPI) => {
    try {
      const res = await Fetch<MenuItem[]>('/menu');
      return res;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch menu');
    }
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    clearMenu: state => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMenu.pending, state => {
        state.loading = true;
      })
      .addCase(fetchMenu.fulfilled, (state, action: PayloadAction<MenuItem[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMenu } = menuSlice.actions;
export default menuSlice.reducer;
