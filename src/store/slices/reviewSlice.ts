
// src/store/slices/reviewSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Fetch } from '../../utils/apiUtils';

interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  loading: false,
  error: null,
};

export const fetchReviews = createAsyncThunk(
  'reviews/fetchAll',
  async (_, thunkAPI) => {
    try {
      const res = await Fetch<Review[]>('/reviews');
      return res;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch reviews');
    }
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchReviews.pending, state => {
        state.loading = true;
      })
      .addCase(fetchReviews.fulfilled, (state, action: PayloadAction<Review[]>) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default reviewSlice.reducer;
    