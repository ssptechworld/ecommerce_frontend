// --- Libraries

import { configureStore, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

// --- Types
import type { CartType, ProductType } from "@/types/types";

// --- Reducers & Actions

import products, { addProduct, deleteProduct, updateProduct } from "@features/products/productsSlice";
import cart, {
  addToCart,
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  fetchCartFromDB,
  syncAddToCartDB,
  syncUpdateCountDB,
  syncRemoveFromCartDB,
  syncClearCartDB,
  mergeGuestCartDB,
} from "@features/cart/cartSlice";
import users, { deleteUser, updateUserRole } from "@features/users/usersSlice";
import auth, { loginUser, logout, registerUser, resetPassword, updateProfile } from "@features/auth/authSlice";
import orders, { createOrder } from "@features/orders/ordersSlice";
import wishlist, {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  fetchWishlistFromDB,
  syncAddToWishlistDB,
  syncRemoveFromWishlistDB,
  mergeGuestWishlistDB,
} from "@features/wishlist/wishlistSlice";
import statistics from "@features/statistics/statisticsSlice";

// --- Custom Middlewares

const customMiddleware = createListenerMiddleware();

// -- localStorage & DB Sync

// - cart
customMiddleware.startListening({
  matcher: isAnyOf(addToCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart),
  effect: (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const isAuthenticated = state.auth.isAuthenticated;

    if (isAuthenticated) {
      // Sync to DB
      if (addToCart.match(action)) {
        listenerApi.dispatch(syncAddToCartDB(action.payload));
      } else if (increaseQuantity.match(action) || decreaseQuantity.match(action)) {
        const item = state.cart.cart.find((i) => i.productId === action.payload);
        if (item) {
          listenerApi.dispatch(syncUpdateCountDB({ productId: item.productId, count: item.count }));
        }
      } else if (removeFromCart.match(action)) {
        listenerApi.dispatch(syncRemoveFromCartDB(action.payload));
      } else if (clearCart.match(action)) {
        listenerApi.dispatch(syncClearCartDB());
      }
    } else {
      // Guest: persist to cart_guest
      window.localStorage.setItem("cart_guest", JSON.stringify(state.cart.cart));
    }
  },
});

// - wishlist
customMiddleware.startListening({
  matcher: isAnyOf(addToWishlist, removeFromWishlist, clearWishlist),
  effect: (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const isAuthenticated = state.auth.isAuthenticated;

    if (isAuthenticated) {
      // Sync to DB
      if (addToWishlist.match(action)) {
        listenerApi.dispatch(syncAddToWishlistDB(action.payload));
      } else if (removeFromWishlist.match(action)) {
        listenerApi.dispatch(syncRemoveFromWishlistDB(action.payload));
      }
    } else {
      // Guest: persist to wishlist_guest
      window.localStorage.setItem("wishlist_guest", JSON.stringify(state.wishlist.items));
    }
  },
});

// - auth

// Register & Login
customMiddleware.startListening({
  matcher: isAnyOf(loginUser.fulfilled, updateProfile.fulfilled, updateUserRole.fulfilled),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    if (state.auth.user) {
      window.localStorage.setItem("user", JSON.stringify(state.auth.user));
    }
  },
});

// On login: load user cart & wishlist from DB + merge guest items if present
customMiddleware.startListening({
  actionCreator: loginUser.fulfilled,
  effect: (_action, listenerApi) => {
    // 1. Check guest cart in localStorage
    let guestCart: CartType[] = [];
    try {
      guestCart = JSON.parse(window.localStorage.getItem("cart_guest") || "[]") as CartType[];
    } catch {
      guestCart = [];
    }

    if (guestCart.length > 0) {
      listenerApi.dispatch(mergeGuestCartDB(guestCart));
      window.localStorage.removeItem("cart_guest");
    } else {
      listenerApi.dispatch(fetchCartFromDB());
    }

    // 2. Check guest wishlist in localStorage
    let guestWishlist: ProductType[] = [];
    try {
      guestWishlist = JSON.parse(window.localStorage.getItem("wishlist_guest") || "[]") as ProductType[];
    } catch {
      guestWishlist = [];
    }

    if (guestWishlist.length > 0) {
      listenerApi.dispatch(mergeGuestWishlistDB(guestWishlist));
      window.localStorage.removeItem("wishlist_guest");
    } else {
      listenerApi.dispatch(fetchWishlistFromDB());
    }
  },
});

// Logout: clear local state and guest keys
customMiddleware.startListening({
  matcher: isAnyOf(logout),
  effect: (_action, listenerApi) => {
    window.localStorage.removeItem("user");
    window.localStorage.removeItem("cart_guest");
    window.localStorage.removeItem("wishlist_guest");
    listenerApi.dispatch(clearCart());
    listenerApi.dispatch(clearWishlist());
  },
});

// --- toast

// -- Cart

// - toast : add to cart

customMiddleware.startListening({
  matcher: isAnyOf(addToCart),
  effect: () => {
    toast.success("Product has been added to cart!", {
      id: "cart-toast",
    });
  },
});

// - toast : remove from cart

customMiddleware.startListening({
  matcher: isAnyOf(removeFromCart),
  effect: () => {
    toast.error("Product removed from cart", {
      id: "cart-toast",
    });
  },
});

// - toast : add to wishlist
customMiddleware.startListening({
  matcher: isAnyOf(addToWishlist),
  effect: () => {
    toast.success("Saved for later! ♥", {
      id: "wishlist-toast",
    });
  },
});

// - toast : remove from wishlist
customMiddleware.startListening({
  matcher: isAnyOf(removeFromWishlist),
  effect: () => {
    toast.error("Removed from saved items", {
      id: "wishlist-toast",
    });
  },
});

// -- User

// - toast : update user

customMiddleware.startListening({
  matcher: isAnyOf(updateUserRole.fulfilled),
  effect: () => {
    toast.success("User has been updated successfully", {
      id: "user-toast",
    });
  },
});

// - toast : remove user

customMiddleware.startListening({
  matcher: isAnyOf(deleteUser.fulfilled),
  effect: () => {
    toast.error("User has been deleted", {
      id: "user-toast",
    });
  },
});

// -- Auth

// - toast : Register

// rejected
customMiddleware.startListening({
  matcher: isAnyOf(registerUser.rejected),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    toast.error(state.auth.error, {
      id: "register-toast",
    });
  },
});

// - toast : Login

// rejected
customMiddleware.startListening({
  matcher: isAnyOf(loginUser.rejected),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    toast.error(state.auth.error, {
      id: "login-toast",
    });
  },
});

// - toast : Reset Password

// fulfilled
customMiddleware.startListening({
  matcher: isAnyOf(resetPassword.fulfilled),
  effect: (action) => {
    toast.success(action.payload as string, {
      id: "password-toast",
    });
  },
});

// rejected
customMiddleware.startListening({
  matcher: isAnyOf(resetPassword.rejected),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    toast.error(state.auth.error, {
      id: "password-toast",
    });
  },
});

// - toast : Update Profile

// fulfilled
customMiddleware.startListening({
  matcher: isAnyOf(updateProfile.fulfilled),
  effect: () => {
    toast.success("Your profile has been updated successfully!", {
      id: "profile-toast",
    });
  },
});

// rejected
customMiddleware.startListening({
  matcher: isAnyOf(updateProfile.rejected),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    toast.error(state.auth.error, {
      id: "profile-toast",
    });
  },
});

// -- Products

// - toast : add product (Admin)
customMiddleware.startListening({
  matcher: isAnyOf(addProduct.fulfilled),
  effect: () => {
    toast.success("Product has been added successfully!", {
      id: "add-product-toast",
    });
  },
});

// - toast : update product (Admin)
customMiddleware.startListening({
  matcher: isAnyOf(updateProduct.fulfilled),
  effect: () => {
    toast.success("Product has been updated successfully!", {
      id: "update-product-toast",
    });
  },
});

// - toast : delete product (Admin)
customMiddleware.startListening({
  matcher: isAnyOf(deleteProduct.fulfilled),
  effect: () => {
    toast.error("Product has been deleted", {
      id: "update-product-toast",
    });
  },
});

// -- Orders

// - toast : create order
customMiddleware.startListening({
  matcher: isAnyOf(createOrder.fulfilled),
  effect: (_action, listenerApi) => {
    toast.success("Your order has been placed successfully!", {
      id: "order-toast",
    });
    listenerApi.dispatch(clearCart());
  },
});

// --- Store

const store = configureStore({
  reducer: {
    products,
    cart,
    users,
    auth,
    orders,
    statistics,
    wishlist,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(customMiddleware.middleware),
});

// --- Store Types

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
