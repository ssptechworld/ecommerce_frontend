// --- Libraries
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// --- Utils
import api from "@utils/api";

// --- Types
import type { CartType } from "@/types/types";

// --- Error Message
const errorMsg = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "Server Error";
  }
  return error instanceof Error ? error.message : "Something went wrong!";
};

// --- Per-user localStorage helpers
export const getCartKey = (userId?: string) => (userId ? `cart_${userId}` : "cart_guest");

const loadCartFromStorage = (key: string): CartType[] => {
  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

// --- localStorage (load guest cart on init)
const cart: CartType[] = loadCartFromStorage("cart_guest");

// --- CartState (Types)
export type CartState = {
  cart: CartType[];
  loading: boolean;
  error: string;
};

// --- initialState
const initialState: CartState = {
  cart: cart,
  loading: false,
  error: "",
};

// --- Async Thunks for DB persistence

/** Fetch cart from DB on login */
export const fetchCartFromDB = createAsyncThunk<CartType[], void, { rejectValue: string }>(
  "cart/fetchCartFromDB",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/cart");
      return response.data;
    } catch (error) {
      return rejectWithValue(errorMsg(error));
    }
  },
);

/** Add or update item in DB */
export const syncAddToCartDB = createAsyncThunk<CartType, CartType, { rejectValue: string }>(
  "cart/syncAddToCartDB",
  async (item, { rejectWithValue }) => {
    try {
      const response = await api.post("/cart", item);
      return response.data;
    } catch (error) {
      return rejectWithValue(errorMsg(error));
    }
  },
);

/** Update item count in DB */
export const syncUpdateCountDB = createAsyncThunk<
  { productId: string; count: number },
  { productId: string; count: number },
  { rejectValue: string }
>("cart/syncUpdateCountDB", async ({ productId, count }, { rejectWithValue }) => {
  try {
    await api.patch(`/cart/${productId}`, { count });
    return { productId, count };
  } catch (error) {
    return rejectWithValue(errorMsg(error));
  }
});

/** Remove item from DB */
export const syncRemoveFromCartDB = createAsyncThunk<string, string, { rejectValue: string }>(
  "cart/syncRemoveFromCartDB",
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`/cart/${productId}`);
      return productId;
    } catch (error) {
      return rejectWithValue(errorMsg(error));
    }
  },
);

/** Clear all cart items in DB */
export const syncClearCartDB = createAsyncThunk<void, void, { rejectValue: string }>(
  "cart/syncClearCartDB",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete("/cart");
    } catch (error) {
      return rejectWithValue(errorMsg(error));
    }
  },
);

/** Merge guest cart items into DB on login */
export const mergeGuestCartDB = createAsyncThunk<CartType[], CartType[], { rejectValue: string }>(
  "cart/mergeGuestCartDB",
  async (guestItems, { rejectWithValue }) => {
    try {
      const response = await api.post("/cart/merge", guestItems);
      return response.data;
    } catch (error) {
      return rejectWithValue(errorMsg(error));
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartState: (state, action: PayloadAction<CartType[]>) => {
      state.cart = action.payload;
    },
    addToCart: (state, action: PayloadAction<CartType>) => {
      const product = state.cart.find((item) => item.productId === action.payload.productId);
      if (product) {
        product.count += action.payload.count;
      } else {
        state.cart.push(action.payload);
      }
    },
    increaseQuantity: (state, action: PayloadAction<string>) => {
      const product = state.cart.find((item) => item.productId === action.payload);
      if (product) product.count++;
    },
    decreaseQuantity: (state, action: PayloadAction<string>) => {
      const product = state.cart.find((item) => item.productId === action.payload);
      if (product && product.count > 1) product.count--;
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter((item) => item.productId !== action.payload);
    },
    clearCart: (state) => {
      state.cart = [];
    },
    loadUserCart: (state, action: PayloadAction<string>) => {
      const key = getCartKey(action.payload);
      state.cart = loadCartFromStorage(key);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCartFromDB.fulfilled, (state, action) => {
      state.loading = false;
      state.cart = action.payload;
    });
    builder.addCase(mergeGuestCartDB.fulfilled, (state, action) => {
      state.loading = false;
      state.cart = action.payload;
    });
  },
});

// --- actions
export const {
  setCartState,
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  loadUserCart,
} = cartSlice.actions;

export default cartSlice.reducer;


