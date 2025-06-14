// src/store/slices/reservationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Fetch } from '../../utils/apiUtils';

interface ReservationSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

interface ReservationState {
  slots: ReservationSlot[];
  loading: boolean;
  error: string | null;
}

const initialState: ReservationState = {
  slots: [],
  loading: false,
  error: null,
};

export const fetchReservationSlots = createAsyncThunk(
  'reservation/fetchSlots',
  async (_, thunkAPI) => {
    try {
      const res = await Fetch<ReservationSlot[]>('/reservation/slots');
      return res;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch slots');
    }
  }
);

const reservationSlice = createSlice({
  name: 'reservation',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchReservationSlots.pending, state => {
        state.loading = true;
      })
      .addCase(fetchReservationSlots.fulfilled, (state, action: PayloadAction<ReservationSlot[]>) => {
        state.loading = false;
        state.slots = action.payload;
      })
      .addCase(fetchReservationSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default reservationSlice.reducer;