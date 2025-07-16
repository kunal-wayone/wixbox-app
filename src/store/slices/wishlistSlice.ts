import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Fetch, Post, Delete } from '../../utils/apiUtils';

interface Shop {
  id: number;
  restaurant_name: string;
  restaurant_images: string[];
  address: string;
  city: string;
  state: string;
  phone: string;
  [key: string]: any;
}

interface MenuItem {
  id: number;
  item_name: string;
  price: string;
  description: string;
  stock_quantity: number;
  unit: string;
  subunit: string;
  status: number;
  images: string[];
  shop: Shop;
  category: {
    id: number;
    name: string;
  };
  average_rating: number;
  is_wishlisted: boolean;
}

interface WishlistState {
  shop_ids: number[];
  menu_items: MenuItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: WishlistState = {
  shop_ids: [],
  menu_items: [],
  status: 'idle',
  error: null,
};

// Fetch wishlist (unified API response)
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await Fetch('/user/wishlist', undefined, 5000);
      return response.data.wishlist; // array of { id, type, data }
    } catch (error) {
      return rejectWithValue('Failed to fetch wishlist');
    }
  }
);

// Add item
export const addWishlistItem = createAsyncThunk(
  'wishlist/addWishlistItem',
  async (body: { menu_item_id: number }, { rejectWithValue }) => {
    try {
      const response: any = await Post('/user/wishlist-product', body, 5000);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to add wishlist item');
    }
  }
);

// Remove item
export const removeWishlistItem = createAsyncThunk(
  'wishlist/removeWishlistItem',
  async (body: { menu_item_id: number }, { rejectWithValue }) => {
    try {
      await Delete('/user/wishlist-product', body, {}, 5000);
      return body.menu_item_id;
    } catch (error) {
      return rejectWithValue('Failed to remove wishlist item');
    }
  }
);

// Add shop
export const addWishlistShop = createAsyncThunk(
  'wishlist/addWishlistShop',
  async (body: { shop_id: number }, { rejectWithValue }) => {
    try {
      const response: any = await Post('/user/wishlist-place', body, 5000);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to add wishlist shop');
    }
  }
);

// Remove shop
export const removeWishlistShop = createAsyncThunk(
  'wishlist/removeWishlistShop',
  async (body: { shop_id: number }, { rejectWithValue }) => {
    try {
      await Delete('/user/wishlist-place', body, {}, 5000);
      return body.shop_id;
    } catch (error) {
      return rejectWithValue('Failed to remove wishlist shop');
    }
  }
);

// Slice
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },
    resetWishlistState: () => initialState,
  },
  extraReducers: (builder) => {
    builder

      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.status = 'succeeded';

        const shops: number[] = [];
        const items: MenuItem[] = [];

        action.payload.forEach((entry) => {
          if (entry.type === 'Shop' && entry.id && entry.data) {
            shops.push(entry?.data);
          } else if (entry.type === 'MenuItem' && entry.data) {
            items.push(entry.data);
          }
        });
        console.log(shops,items,'dfd')
        state.shop_ids = shops;
        state.menu_items = items;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Add item
      .addCase(addWishlistItem.fulfilled, (state, action: PayloadAction<any>) => {
        const newItem = action.payload.menu_items?.[0];
        if (newItem) {
          const exists = state.menu_items.some(item => item.id === newItem.id);
          if (!exists) state.menu_items.push(newItem);
        }
      })

      // Remove item
      .addCase(removeWishlistItem.fulfilled, (state, action: PayloadAction<number>) => {
        state.menu_items = state.menu_items.filter(item => item.id !== action.payload);
      })

      // Add shop
      .addCase(addWishlistShop.fulfilled, (state, action: PayloadAction<any>) => {
        const newShopId = action.payload.shop_ids?.[0];
        if (newShopId && !state.shop_ids.includes(newShopId)) {
          state.shop_ids.push(newShopId);
        }
      })

      // Remove shop
      .addCase(removeWishlistShop.fulfilled, (state, action: PayloadAction<number>) => {
        state.shop_ids = state.shop_ids.filter(id => id !== action.payload);
        state.menu_items = state.menu_items.filter(item => item.shop.id !== action.payload);
      });
  },
});

// Exports
export const { clearWishlistError, resetWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;
