import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import axios from "axios";
import api from "@utils/api";
import type { CategoriesType, ProductType } from "@/types/types";

const errorMsg = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "Server Error";
  }
  return error instanceof Error ? error.message : "Something went wrong!";
};

type ProductsState = {
  loading: boolean;
  categoryLoading: Record<string, boolean>;
  laptops: ProductType[];
  mobiles: ProductType[];
  specialOffers: ProductType[];
  appliances: ProductType[];
  cookware: ProductType[];
  clothing: ProductType[];
  shoes: ProductType[];
  dresses: ProductType[];
  handbags: ProductType[];
  supermarket: ProductType[];
  automotive: ProductType[];
  singleProduct: ProductType | null;
  error: string;
  totalPages: number;
  currentPage: number;
  totalCount: number;
  fetchedCategories: Record<string, boolean>;
  adminProducts: ProductType[];
  adminTotalPages: number;
  adminCurrentPage: number;
  adminTotalCount: number;
  adminLoading: boolean;
};

type ProductCategoriesKeys = Exclude<
  keyof ProductsState,
  | "loading"
  | "categoryLoading"
  | "error"
  | "singleProduct"
  | "totalPages"
  | "currentPage"
  | "totalCount"
  | "fetchedCategories"
  | "adminProducts"
  | "adminTotalPages"
  | "adminCurrentPage"
  | "adminTotalCount"
  | "adminLoading"
>;

const initialState: ProductsState = {
  loading: false,
  categoryLoading: {},
  laptops: [],
  mobiles: [],
  specialOffers: [],
  appliances: [],
  cookware: [],
  clothing: [],
  shoes: [],
  dresses: [],
  handbags: [],
  supermarket: [],
  automotive: [],
  singleProduct: null,
  error: "",
  totalPages: 0,
  currentPage: 1,
  totalCount: 0,
  fetchedCategories: {},
  adminProducts: [],
  adminTotalPages: 0,
  adminCurrentPage: 1,
  adminTotalCount: 0,
  adminLoading: false,
};

export const fetchProductsByCategory = createAsyncThunk<
  {
    products: ProductType[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    category: string;
  },
  | CategoriesType
  | {
      category: CategoriesType;
      page?: number;
      limit?: number;
      sort?: string;
      keyword?: string;
      minPrice?: number;
      maxPrice?: number;
    },
  { rejectValue: string }
>("products/category", async (arg, { rejectWithValue }) => {
  try {
    const category = typeof arg === "string" ? arg : arg.category;
    const page = typeof arg === "object" ? arg.page || 1 : 1;
    const limit = typeof arg === "object" ? arg.limit || 6 : 100;
    const sort = typeof arg === "object" && arg.sort ? arg.sort : "";
    const keyword = typeof arg === "object" && arg.keyword ? arg.keyword : "";
    const minPrice = typeof arg === "object" && arg.minPrice !== undefined ? arg.minPrice : "";
    const maxPrice = typeof arg === "object" && arg.maxPrice !== undefined ? arg.maxPrice : "";

    let url = `/products?category=${encodeURIComponent(category)}&page=${page}&limit=${limit}`;
    if (sort) url += `&sort=${encodeURIComponent(sort)}`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    if (minPrice !== "") url += `&minPrice=${minPrice}`;
    if (maxPrice !== "") url += `&maxPrice=${maxPrice}`;

    const response = await api.get(url);

    const products = Array.isArray(response.data?.products)
      ? response.data.products
      : Array.isArray(response.data)
      ? response.data
      : [];

    return {
      products,
      totalCount: response.data?.totalCount ?? 0,
      totalPages: response.data?.totalPages ?? 0,
      currentPage: response.data?.currentPage ?? 1,
      category,
    };
  } catch (error) {
    return rejectWithValue(errorMsg(error));
  }
});

export const fetchAdminProducts = createAsyncThunk<
  {
    products: ProductType[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  },
  {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  },
  { rejectValue: string }
>("products/fetchAdminProducts", async (params, { rejectWithValue }) => {
  try {
    const { category = "all", search = "", page = 1, limit = 10 } = params;
    let url = `/products?admin=true&page=${page}&limit=${limit}`;
    if (category && category !== "all") {
      url += `&category=${encodeURIComponent(category)}`;
    }
    if (search && search.trim() !== "") {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    const response = await api.get(url);
    return {
      products: response.data.products || [],
      totalCount: response.data.totalCount || 0,
      totalPages: response.data.totalPages || 1,
      currentPage: response.data.currentPage || 1,
    };
  } catch (error) {
    return rejectWithValue(errorMsg(error));
  }
});

export const toggleProductStatus = createAsyncThunk<
  ProductType,
  { id: string; enabled: boolean },
  { rejectValue: string }
>("products/toggleStatus", async ({ id, enabled }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/products/${id}/status`, { enabled });
    return response.data.product;
  } catch (error) {
    return rejectWithValue(errorMsg(error));
  }
});

export const fetchSingleProduct = createAsyncThunk<ProductType, { id: string }, { rejectValue: string }>(
  "products/single-product",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(errorMsg(error));
    }
  },
);

export const addProduct = createAsyncThunk<ProductType, FormData, { rejectValue: string }>(
  "products/add-product",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post(`/products/add-product`, formData, {
        headers: { "Content-Type": undefined },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(errorMsg(error));
    }
  },
);

export const updateProduct = createAsyncThunk<ProductType, { id: string; formData: FormData }, { rejectValue: string }>(
  "products/update-product",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/${id}`, formData, {
        headers: { "Content-Type": undefined },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(errorMsg(error));
    }
  },
);

export const deleteProduct = createAsyncThunk<
  { id: string; category: string },
  { id: string; category: string },
  { rejectValue: string }
>("products/delete-product", async ({ id, category }, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`);
    return { id, category };
  } catch (error) {
    return rejectWithValue(errorMsg(error));
  }
});

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearSingleProduct: (state) => {
      state.singleProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProductsByCategory.fulfilled, (state, action) => {
      state.loading = false;
      const { category, products, totalPages, currentPage, totalCount } = action.payload;
      const key = category as ProductCategoriesKeys;

      if (state[key]) {
        state[key] = Array.isArray(products) ? products : [];
      }
      state.totalPages = totalPages ?? 0;
      state.currentPage = currentPage ?? 1;
      state.totalCount = totalCount ?? 0;
      state.categoryLoading[category] = false;
      state.fetchedCategories[category] = true;
      state.error = "";
    });

    builder.addCase(fetchAdminProducts.pending, (state) => {
      state.adminLoading = true;
      state.error = "";
    });

    builder.addCase(fetchAdminProducts.fulfilled, (state, action) => {
      state.adminLoading = false;
      state.adminProducts = action.payload.products;
      state.adminTotalPages = action.payload.totalPages;
      state.adminCurrentPage = action.payload.currentPage;
      state.adminTotalCount = action.payload.totalCount;
      state.error = "";
    });

    builder.addCase(fetchAdminProducts.rejected, (state, action) => {
      state.adminLoading = false;
      state.error = action.payload || "Failed to fetch admin products";
    });

    builder.addCase(toggleProductStatus.fulfilled, (state, action) => {
      const updatedProduct = action.payload;
      const index = state.adminProducts.findIndex((p) => p._id === updatedProduct._id);
      if (index !== -1) {
        state.adminProducts[index] = updatedProduct;
      }
      const key = updatedProduct.category as ProductCategoriesKeys;
      if (state[key]) {
        const catIdx = state[key].findIndex((p) => p._id === updatedProduct._id);
        if (catIdx !== -1) {
          state[key][catIdx] = updatedProduct;
        }
      }
      if (state.singleProduct?._id === updatedProduct._id) {
        state.singleProduct = updatedProduct;
      }
    });

    builder.addCase(fetchSingleProduct.fulfilled, (state, action) => {
      state.loading = false;
      state.singleProduct = action.payload;
      state.error = "";
    });

    builder.addCase(addProduct.fulfilled, (state, action) => {
      state.loading = false;
      const newProduct = action.payload;
      const key = newProduct.category as ProductCategoriesKeys;
      if (state[key]) {
        state[key].push(newProduct);
      }
      state.adminProducts.unshift(newProduct);
      state.adminTotalCount += 1;
      state.error = "";
    });

    builder.addCase(updateProduct.fulfilled, (state, action) => {
      state.loading = false;
      const updatedProduct = action.payload;
      const adminIndex = state.adminProducts.findIndex((p) => p._id === updatedProduct._id);
      if (adminIndex !== -1) {
        state.adminProducts[adminIndex] = updatedProduct;
      }
      const key = updatedProduct.category as ProductCategoriesKeys;
      if (state[key]) {
        const index = state[key].findIndex((p) => p._id === updatedProduct._id);
        if (index !== -1) {
          state[key][index] = updatedProduct;
        }
      }
      if (state.singleProduct?._id === updatedProduct._id) {
        state.singleProduct = updatedProduct;
      }
      state.error = "";
    });

    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.loading = false;
      const { id, category } = action.payload;
      const key = category as ProductCategoriesKeys;
      if (state[key]) {
        state[key] = state[key].filter((product) => product._id !== id);
      }
      state.adminProducts = state.adminProducts.filter((product) => product._id !== id);
      state.adminTotalCount = Math.max(0, state.adminTotalCount - 1);
    });

    builder.addMatcher(isAnyOf(fetchProductsByCategory.pending), (state, action) => {
      const arg = action.meta.arg;
      const category = typeof arg === "string" ? arg : arg.category;
      state.categoryLoading[category] = true;
      state.error = "";
    });

    builder.addMatcher(isAnyOf(fetchProductsByCategory.rejected), (state, action) => {
      const arg = action.meta.arg;
      const category = typeof arg === "string" ? arg : arg.category;
      state.categoryLoading[category] = false;
      state.error = action.payload || "An unexpected error occurred";
    });

    builder.addMatcher(
      isAnyOf(fetchSingleProduct.pending, addProduct.pending, updateProduct.pending, deleteProduct.pending),
      (state) => {
        state.loading = true;
        state.error = "";
      },
    );

    builder.addMatcher(
      isAnyOf(fetchSingleProduct.rejected, addProduct.rejected, updateProduct.rejected, deleteProduct.rejected),
      (state, action) => {
        state.loading = false;
        state.error = action.payload || "An unexpected error occurred";
      },
    );
  },
});

export const { clearSingleProduct } = productsSlice.actions;
export default productsSlice.reducer;
