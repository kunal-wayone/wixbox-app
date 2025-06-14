// src/store/slices/tableBookingSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Fetch, Post } from '../../utils/apiUtils';

interface Booking {
    id: string;
    customerId: string;
    tableNumber: number;
    date: string;
    time: string;
    status: string;
}

interface BookingState {
    bookings: Booking[];
    loading: boolean;
    error: string | null;
}

const initialState: BookingState = {
    bookings: [],
    loading: false,
    error: null,
};

export const fetchBookings = createAsyncThunk(
    'bookings/fetchAll',
    async (_, thunkAPI) => {
        try {
            const res = await Fetch<Booking[]>('/bookings');
            return res;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message || 'Failed to fetch bookings');
        }
    }
);

export const createBooking = createAsyncThunk(
    'bookings/create',
    async (bookingData: any, thunkAPI) => {
        try {
            const res = await Post('/bookings', bookingData);
            return res;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message || 'Failed to book table');
        }
    }
);

const tableBookingSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {
        clearBookings: state => {
            state.bookings = [];
            state.error = null;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchBookings.pending, state => {
                state.loading = true;
            })
            .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
                state.loading = false;
                state.bookings = action.payload;
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            //   .addCase(createBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
            //     state.bookings.unshift(action.payload);
            //   })
            .addCase(createBooking.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const { clearBookings } = tableBookingSlice.actions;
export default tableBookingSlice.reducer;
