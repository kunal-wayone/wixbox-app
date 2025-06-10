
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TokenStorage, Fetch } from '../../utils/apiUtils';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

interface UserState {
    data: User | null;
    error: string | null;
    isAuthenticated: boolean;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

// Initial state
const initialState: UserState = {
    data: null,
    error: null,
    status: 'idle',
    isAuthenticated: false,
};

// Async thunk for getting current user
export const getCurrentUser = createAsyncThunk(
    '/user/profile',
    async (_, thunkAPI) => {
        try {
            const token = await TokenStorage.getToken();
            if (!token)
                return thunkAPI.rejectWithValue('Session expired. Please login again.');

            const response = await Fetch<{ data: User; message?: string }>(
                '/user/profile',
            );
            console.log(response)
            return response.data || response;
        } catch (error: any) {
            console.log('getCurrentUser Error: ', error);
            let errorMessage = 'Failed to get user data';
            if (error?.response?.status === 401) {
                errorMessage = 'Session expired. Please login again.'; // Clear token from storage
                try {
                    await TokenStorage.removeToken();
                } catch (tokenError) {
                    console.log('Error clearing token:', tokenError);
                }
            } else if (error?.response?.status === 403) {
                errorMessage = 'Access denied';
            } else if (error?.response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error?.message) {
                errorMessage = error.message;
            }
            return thunkAPI.rejectWithValue(errorMessage);
        }
    },
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
    'user/logout',
    async (_, thunkAPI) => {
        try {
            await TokenStorage.removeToken();
            return true;
        } catch (error: any) {
            try {
                await TokenStorage.removeToken();
            } catch (tokenError) {
                console.log('Error clearing token:', tokenError);
            }
            return thunkAPI.rejectWithValue(error?.message || 'Logout failed');
        }
    },
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearError: state => {
            state.error = null;
        },
        resetUserState: state => {
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
        setAuthStatus: (state, action: PayloadAction<boolean>) => {
            state.isAuthenticated = action.payload;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(getCurrentUser.pending, state => {
                state.error = null;
                state.status = 'loading';
            })
            .addCase(getCurrentUser.fulfilled, (state, action: any) => {
                state.error = null;
                state.status = 'succeeded';
                state.isAuthenticated = true;
                state.data = action.payload.user;
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.data = null;
                state.status = 'failed';
                state.isAuthenticated = false;
                state.error = action.payload as string;
            })
            .addCase(logoutUser.pending, state => {
                state.status = 'loading';
            })
            .addCase(logoutUser.fulfilled, state => {
                state.data = null;
                state.error = null;
                state.status = 'idle';
                state.isAuthenticated = false;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.data = null;
                state.status = 'failed';
                state.isAuthenticated = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, resetUserState, updateUserData, setAuthStatus } =
    userSlice.actions;

export default userSlice.reducer;
