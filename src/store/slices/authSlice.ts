import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import messaging from '@react-native-firebase/messaging';
import { googleLogin, googleSignOut } from '../../utils/authentication/googleAuth';
import { TokenStorage, Post } from '../../utils/apiUtils';

//
// ---------------------- Types ----------------------
//
interface GoogleUser {
    name: string;
    email: string;
    id?: string;
    photo?: string;
    role?: string;
}

interface GoogleLoginResponse {
    user: GoogleUser;
    token: string;
}

interface AuthResponse {
    success: boolean;
    token: string;
    user: GoogleUser;
    message?: string;
}

interface AuthState {
    token: string | null;
    user: GoogleUser | null;
    loading: boolean;
    error: string | null;
    authStatus: 'idle' | 'authenticated' | 'unauthenticated';
}

const initialState: AuthState = {
    token: null,
    user: null,
    loading: false,
    error: null,
    authStatus: 'idle',
};

//
// ---------------------- Login ----------------------
//
export const login = createAsyncThunk(
    'auth/login',
    async (
        credentials: { email: string; password: string },
        thunkAPI
    ) => {
        try {
            const fcm_token = await messaging().getToken();
            const response = await Post<AuthResponse>('/auth/signin', { ...credentials, fcm_token }, 5000);
            const { success, data, message }: any = response;
            const user = data?.user
            const token = data?.token

            console.log(false)
            if (success && token) {
                await TokenStorage.setToken(token);
                await TokenStorage.setUserData(user);
                return { success, token, user, message };
            } else {
                throw new Error(message || 'Login failed');
            }
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.message || 'Login error');
        }
    }
);

//
// ---------------------- Signup ----------------------
//
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
        thunkAPI
    ) => {
        try {
            const fcm_token = await messaging().getToken();
            console.log({ ...payload, fcm_token })
            const response = await Post<AuthResponse>('/auth/signup', { ...payload, fcm_token }, 5000);
            // console.log(response?.data)
            const { success, message }: any = response;
            const token: any = response?.data?.token;
            const user: any = response?.data?.user;

            console.log(token)

            if (success && token) {
                await TokenStorage.setToken(token);
                await TokenStorage.setUserData(user);
                return { token, user, success };
            } else {
                throw new Error(message || 'Signup failed');
            }
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error || 'Signup error');
        }
    }
);

//
// ---------------------- Google Auth ----------------------
//
export const googleAuth = createAsyncThunk(
    'auth/googleAuth',
    async (payload: any, thunkAPI) => {
        try {
            const { user: googleUser, token: idToken }: GoogleLoginResponse = await googleLogin();
            const fcm_token = await messaging().getToken();
            console.log(googleUser, idToken)
            const formData = new FormData();
            formData.append('name', googleUser.name);
            formData.append('email', googleUser.email);
            formData.append('idToken', idToken);
            formData.append('role', payload?.role ?? ""); // adjust as needed
            formData.append('fcm_token', fcm_token);
            const response: any = await Post('/auth/google-login', formData, 5000)

            const { success, token, user, message } = response.data;

            if (success && token) {
                await TokenStorage.setToken(token);
                await TokenStorage.setUserData(user);
                return { token, user };
            } else {
                throw new Error(message || 'Google login failed at server');
            }
        } catch (error: any) {
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                'Google login failed';
            return thunkAPI.rejectWithValue(msg);
        }
    }
);

//
// ---------------------- Logout ----------------------
//
export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
    try {
        await TokenStorage.removeToken();
        await TokenStorage.removeUser();
        await TokenStorage.removeRole();
        await googleSignOut()
        return true;
    } catch (error: any) {
        return thunkAPI.rejectWithValue('Logout failed');
    }
});

//
// ---------------------- Slice ----------------------
//
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        resetAuth: (state) => {
            Object.assign(state, initialState);
        },
        setAuthStatus: (
            state,
            action: PayloadAction<'idle' | 'authenticated' | 'unauthenticated'>
        ) => {
            state.authStatus = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; user: GoogleUser }>) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.authStatus = 'authenticated';
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.authStatus = 'unauthenticated';
            });

        // Signup
        builder
            .addCase(signup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state, action: PayloadAction<{ token: string; user: GoogleUser }>) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.authStatus = 'authenticated';
            })
            .addCase(signup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.authStatus = 'unauthenticated';
            });

        // Google Auth
        builder
            .addCase(googleAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(googleAuth.fulfilled, (state, action: PayloadAction<{ token: string; user: GoogleUser }>) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.authStatus = 'authenticated';
            })
            .addCase(googleAuth.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.authStatus = 'unauthenticated';
            });

        // Logout
        builder
            .addCase(logout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.token = null;
                state.user = null;
                state.loading = false;
                state.authStatus = 'unauthenticated';
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetAuth, setAuthStatus } = authSlice.actions;
export default authSlice.reducer;
