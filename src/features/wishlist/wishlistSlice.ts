// --- Libraries
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// --- Utils
import api from "@utils/api";

// --- Types
import type { ProductType } from "@/types/types";

// --- Error Message
const errorMsg = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "Server Error";
  }
  return error instanceof Error ? error.message : "Something went wrong!";
};

// --- Per-user localStorage helpers
export const getWishlistKey = (userId?: string) => (userId ? `wishlist_${userId}` : "wishlist_guest");

const loadWishlistFromStorage = (key: string): ProductType[] => {
  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

// --- localStorage (load guest wishlist on init)
const savedItems: ProductType[] = loadWishlistFromStorage("wishlist_guest");

// --- WishlistState (Types)
export type WishlistState = {
  items: ProductType[];
  loading: boolean;
  error: string;
};

// --- initialState
const initialState: WishlistState = {
  items: savedItems,
  loading: false,
  error: "",
};

// --- Async Thunks for DB persistence

/** Fetch wishlist from DB on login */
export const fetchWishlistFromDB = createAsyncThunk<ProductType[], void, { rejectValue: string }>(
  "wishlist/fetchWishlistFromDB",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/wishlist");
      // Normalize DB WishlistItem entity format to ProductType format if needed
      return response.data.map((item: any) => ({
        _id: item.productId || item._id,
        title: item.title,
        images: [{ url: item.image }],
        price: item.price,
        priceAfterDiscount: item.priceAfterDiscount || item.price,
        category: item.category || "",
        rating: item.rating || 0,
        reviewsCount: item.reviewsCount || 0,
      }));
    } catch (error) {
      return rejectWithValue(errorMsg(error));
    }
  },
);

/** Add item to wishlist in DB */
export const syncAddToWishlistDB = createAsyncThunk<void, ProductType, { rejectValue: string }>(
  "wishlist/syncAddToWishlistDB",
  async (product, { rejectWithValue }) => {
    try {
      const payload = {
        productId: product._id,
        title: product.title,
        image: product.images[0]?.url || "",
        price: product.price,
        priceAfterDiscount: product.priceAfterDiscount,
        category: product.category,
        rating: product.rating,
        reviewsCount: product.reviewsCount,
      };
      await api.post("/wishlist", payload);
    } catch (error) {
      return rejectWithValue(errorMsg(error));
    }
  },
);

/** Remove item from wishlist in DB */
export const syncRemoveFromWishlistDB = createAsyncThunk<string, string, { rejectValue: string }>(
  "wishlist/syncRemoveFromWishlistDB",
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      return productId;
    } catch (error) {
      return rejectWithValue(errorMsg(error));
    }
  },
);

/** Merge guest wishlist items into DB on login */
export const mergeGuestWishlistDB = createAsyncThunk<ProductType[], ProductType[], { rejectValue: string }>(
  "wishlist/mergeGuestWishlistDB",
  async (guestItems, { rejectWithValue }) => {
    try {
      const payload = guestItems.map((item) => ({
        productId: item._id,
        title: item.title,
        image: item.images[0]?.url || "",
        price: item.price,
        priceAfterDiscount: item.priceAfterDiscount,
        category: item.category,
        rating: item.rating,
        reviewsCount: item.reviewsCount,
      }));
      const response = await api.post("/wishlist/merge", payload);
      return response.data.map((item: any) => ({
        _id: item.productId || item._id,
        title: item.title,
        images: [{ url: item.image }],
        price: item.price,
        priceAfterDiscount: item.priceAfterDiscount || item.price,
        category: item.category || "",
        rating: item.rating || 0,
        reviewsCount: item.reviewsCount || 0,
      }));
    } catch (error) {
      return rejectWithValue(errorMsg(error));
    }
  },
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlistState: (state, action: PayloadAction<ProductType[]>) => {
      state.items = action.payload;
    },
    addToWishlist: (state, action: PayloadAction<ProductType>) => {
      const exists = state.items.find((item) => item._id === action.payload._id);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
    clearWishlist: (state) => {
      state.items = [];
    },
    loadUserWishlist: (state, action: PayloadAction<string>) => {
      const key = getWishlistKey(action.payload);
      state.items = loadWishlistFromStorage(key);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWishlistFromDB.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(mergeGuestWishlistDB.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
  },
});

// --- actions
export const {
  setWishlistState,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  loadUserWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;


