import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TokenStorage, Post } from '../../utils/apiUtils';
import { googleLogin } from '../../utils/authentication/googleAuth';

interface User {
    role: string;
    // Add other properties like name, email if needed
}

interface AuthState {
    token: string | null;
    user: User | null;
    loading: boolean;
    error: string | null;
    authStatus: 'idle' | 'authenticated' | 'unauthenticated';
}

interface SignupResponse {
    token: string;
    user: User;
    success: boolean;
    message?: string;
}

const initialState: AuthState = {
    token: null,
    user: null,
    loading: false,
    error: null,
    authStatus: 'idle',
};

// Login
export const login = createAsyncThunk(
    'auth/login',
    async (
        credentials: { email: string; password: string },
        thunkAPI
    ) => {
        try {
            const response: any = await Post<{ token: string }>('/auth/signin', credentials, 5000);
            const { token, user } = response.data;
            if (token) {
                await TokenStorage.setToken(token);
                await TokenStorage.setUserData(user)
                return { token, user };
            }
            throw new Error('Token not found');
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error || 'Login failed');
        }
    }
);

// Signup
export const signup = createAsyncThunk(
    'auth/signup',
    async (
        payload: {
            name: string;
            email: string;
            password: string;
            password_confirmation: string;
            role: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await Post<any>('/auth/signup', payload, 5000);
            const { token, user, message } = response?.data;
            const { success } = response;

            console.log(success, user, message)
            if (success && token) {
                await TokenStorage.setToken(token);
                await TokenStorage.setUserData(user)
                return { token, user };
            } else {
                throw new Error(message || 'Signup failed');
            }
        } catch (error: any) {
            console.log(error)
            return rejectWithValue(error);
        }
    }
);


// Logout
export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
    try {
        await TokenStorage.removeToken();
        await TokenStorage.removeUser();
        await TokenStorage.removeRole();
        return true;
    } catch (error: any) {
        return thunkAPI.rejectWithValue('Logout failed');
    }
});


export const googleAuth = createAsyncThunk(
    'auth/googleAuth',
    async (_, thunkAPI) => {
        try {
            const { user, token } = await googleLogin();

            await TokenStorage.setToken(token);
            await TokenStorage.setUserData(user);

            return { token, user };
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.message || 'Google login failed');
        }
    }
);


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        resetAuth: (state) => {
            Object.assign(state, initialState);
        },
        setAuthStatus: (state, action: PayloadAction<'idle' | 'authenticated' | 'unauthenticated'>) => {
            state.authStatus = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.authStatus = 'authenticated';
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.authStatus = 'unauthenticated';
            })

            // Signup
            .addCase(signup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.authStatus = 'authenticated';
            })
            .addCase(signup.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as any)?.message || 'Signup failed';
                state.authStatus = 'unauthenticated';
            })

            // Logout
            .addCase(logout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.token = null;
                state.user = null;
                state.error = null;
                state.loading = false;
                state.authStatus = 'unauthenticated';
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Goolge Login cases
            .addCase(googleAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(googleAuth.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.authStatus = 'authenticated';
            })
            .addCase(googleAuth.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.authStatus = 'unauthenticated';
            })

    }
});

export const { resetAuth, setAuthStatus } = authSlice.actions;
export default authSlice.reducer;
