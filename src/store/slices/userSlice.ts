// src/store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Fetch, TokenStorage } from '../../utils/apiUtils';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
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

// Fetch current user
export const fetchUser = createAsyncThunk(
    'user/fetchUser',
    async (_, { rejectWithValue }) => {
        try {

            const response: any = await Fetch<{ data: User }>('/user/profile', undefined, 5000);
            await TokenStorage.setUserData(response?.data)
            return response.data;
        } catch (error: any) {
            console.log(error)
            let errorMessage = 'Failed to fetch user data';
            // TokenStorage.removeToken();
            // TokenStorage.removeUser();
            // TokenStorage.removeRole();
            return rejectWithValue(errorMessage);
        }
    }
);

// Logout (aligned with authSlice)
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
            .addCase(logoutUser.fulfilled, (state) => {
                state.data = null;
                state.status = 'idle';
                state.error = null;
                state.isAuthenticated = false;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { clearError, resetUserState, updateUserData } = userSlice.actions;
export default userSlice.reducer;