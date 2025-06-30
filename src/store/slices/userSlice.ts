import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Fetch, Post, TokenStorage } from '../../utils/apiUtils';

// 1. Extend User interface
interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;

    // Location fields
    latitude?: number;
    longitude?: number;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    landmark?: string;
    locality?: string;
}

interface UserState {
    data: User | null;
    error: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    isAuthenticated: boolean;
}

const initialState: UserState = {
    data: null,
    error: null,
    status: 'idle',
    isAuthenticated: false,
};

// 2. Fetch current user
export const fetchUser = createAsyncThunk(
    'user/fetchUser',
    async (_, { rejectWithValue }) => {
        try {
            const response: any = await Fetch<{ data: User }>('/user/profile', undefined, 5000);
            await TokenStorage.setUserData(response?.data);
            return response.data;
        } catch (error: any) {
            console.log(error);
            return rejectWithValue('Failed to fetch user data');
        }
    }
);

// 3. Update user location
export const updateUserLocation = createAsyncThunk(
    'user/updateUserLocation',
    async (
        location: {
            address: {
                latitude: number;
                longitude: number;
            }
        },
        { rejectWithValue }
    ) => {
        try {
            /**
             * Example usage:
             * location = {
             *   latitude: 19.076,
             *   longitude: 72.8777,
             *   city: "Mumbai",
             *   state: "Maharashtra",
             *   country: "India",
             *   pincode: "400001",
             *   landmark: "Gateway of India",
             *   locality: "Colaba"
             * }
             */
            console.log(location)
            const response: any = await Post('/user/update-profile', location, 5000);
            const updatedUser = {
                ...response.data,
                ...location,
            };
            console.log(response)
            await TokenStorage.setUserData(updatedUser);
            return updatedUser;
        } catch (error: any) {
            console.error('Location update failed', error);
            return rejectWithValue('Failed to update user location');
        }
    }
);

// 4. Logout
export const logoutUser = createAsyncThunk(
    'user/logout',
    async (_, { rejectWithValue }) => {
        try {
            await TokenStorage.removeToken();
            return true;
        } catch (error: any) {
            return rejectWithValue('Logout failed');
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetUserState: (state) => {
            state.data = null;
            state.status = 'idle';
            state.error = null;
            state.isAuthenticated = false;
        },
        updateUserData: (state, action: PayloadAction<Partial<User>>) => {
            if (state.data) {
                state.data = { ...state.data, ...action.payload };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch User
            .addCase(fetchUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.status = 'succeeded';
                state.data = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.status = 'failed';
                state.data = null;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            })

            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.data = null;
                state.status = 'idle';
                state.error = null;
                state.isAuthenticated = false;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Update Location
            .addCase(updateUserLocation.fulfilled, (state, action: PayloadAction<User>) => {
                if (state.data) {
                    state.data = { ...state.data, ...action.payload };
                }
            })
            .addCase(updateUserLocation.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

// 5. Exports
export const { clearError, resetUserState, updateUserData } = userSlice.actions;
export default userSlice.reducer;
