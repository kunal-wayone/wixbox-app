
// src/store/slices/managerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Fetch } from '../../utils/apiUtils';

interface Manager {
  id: string;
  name: string;
  email: string;
}

interface ManagerState {
  managers: Manager[];
  loading: boolean;
  error: string | null;
}

const initialState: ManagerState = {
  managers: [],
  loading: false,
  error: null,
};

export const fetchManagers = createAsyncThunk(
  'manager/fetchAll',
  async (_, thunkAPI) => {
    try {
      const res = await Fetch<Manager[]>('/managers');
      return res;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch managers');
    }
  }
);

const managerSlice = createSlice({
  name: 'manager',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchManagers.pending, state => {
        state.loading = true;
      })
      .addCase(fetchManagers.fulfilled, (state, action: PayloadAction<Manager[]>) => {
        state.loading = false;
        state.managers = action.payload;
      })
      .addCase(fetchManagers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default managerSlice.reducer;
