import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Fetch, Post, Delete } from '../../utils/apiUtils';

interface WishlistItem {
    menu_item_id: string;
    name?: string;
    price?: number;
    added_at?: string;
}

interface WishlistShop {
    shop_id: string;
    name?: string;
    added_at?: string;
}

interface WishlistState {
    items: WishlistItem[];
    shops: WishlistShop[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: WishlistState = {
    items: [],
    shops: [],
    status: 'idle',
    error: null,
};

// Add item to wishlist
export const addWishlistItem = createAsyncThunk(
    'wishlist/addItem',
    async (body: { menu_item_id: string }, { rejectWithValue }) => {
        try {
            const response: any = await Post('/user/wishlist-place', body, 5000);
            console.log(response)
            return response.data;
        } catch (error: any) {
            console.error('Failed to add item to wishlist', error);
            return rejectWithValue('Failed to add item to wishlist');
        }
    }
);

// Add shop to wishlist
export const addWishlistShop = createAsyncThunk(
    'wishlist/addShop',
    async (body: { shop_id: string }, { rejectWithValue }) => {
        try {
            const response: any = await Post('/user/wishlist-place', body, 5000);
            console.log(response)
            return response.data;
        } catch (error: any) {
            console.error('Failed to add shop to wishlist', error);
            return rejectWithValue('Failed to add shop to wishlist');
        }
    }
);

// Remove item from wishlist
export const removeWishlistItem = createAsyncThunk(
    'wishlist/removeItem',
    async (body: { menu_item_id: string }, { rejectWithValue }) => {
        try {
            await Delete('/user/wishlist-place', body, {}, 5000);
            return body.menu_item_id;
        } catch (error: any) {
            console.error('Failed to remove item from wishlist', error);
            return rejectWithValue('Failed to remove item from wishlist');
        }
    }
);

// Remove shop from wishlist
export const removeWishlistShop = createAsyncThunk(
    'wishlist/removeShop',
    async (body: { shop_id: string }, { rejectWithValue }) => {
        try {
            await Delete('/user/wishlist-place', body, {}, 5000);
            return body.shop_id;
        } catch (error: any) {
            console.error('Failed to remove shop from wishlist', error);
            return rejectWithValue('Failed to remove shop from wishlist');
        }
    }
);

// Fetch wishlist
export const fetchWishlist = createAsyncThunk(
    'wishlist/fetchWishlist',
    async (_, { rejectWithValue }) => {
        try {
            const response: any = await Fetch<{ items: WishlistItem[]; shops: WishlistShop[] }>(
                '/user/wishlist-place',
                undefined,
                5000
            );
            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch wishlist', error);
            return rejectWithValue('Failed to fetch wishlist');
        }
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetWishlistState: (state) => {
            state.items = [];
            state.shops = [];
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Wishlist
            .addCase(fetchWishlist.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<{ items: WishlistItem[]; shops: WishlistShop[] }>) => {
                state.status = 'succeeded';
                state.items = action.payload.items;
                state.shops = action.payload.shops;
                state.error = null;
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Add Item
            .addCase(addWishlistItem.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(addWishlistItem.fulfilled, (state, action: PayloadAction<WishlistItem>) => {
                state.status = 'succeeded';
                state.items.push(action.payload);
                state.error = null;
            })
            .addCase(addWishlistItem.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Add Shop
            .addCase(addWishlistShop.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(addWishlistShop.fulfilled, (state, action: PayloadAction<WishlistShop>) => {
                state.status = 'succeeded';
                state.shops.push(action.payload);
                state.error = null;
            })
            .addCase(addWishlistShop.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Remove Item
            .addCase(removeWishlistItem.fulfilled, (state, action: PayloadAction<string>) => {
                state.status = 'succeeded';
                state.items = state.items.filter(item => item.menu_item_id !== action.payload);
                state.error = null;
            })
            .addCase(removeWishlistItem.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Remove Shop
            .addCase(removeWishlistShop.fulfilled, (state, action: PayloadAction<string>) => {
                state.status = 'succeeded';
                state.shops = state.shops.filter(shop => shop.shop_id !== action.payload);
                state.error = null;
            })
            .addCase(removeWishlistShop.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { clearError, resetWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;