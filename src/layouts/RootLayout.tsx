// --- Libraries
import { useEffect, Suspense } from "react";
import { Outlet } from "react-router";

// --- Local Files
import ScrollToTop from "@components/scroll-to-top/ScrollToTop";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchCartFromDB } from "@features/cart/cartSlice";
import { fetchWishlistFromDB } from "@features/wishlist/wishlistSlice";

// --- Components
import Header from "@layouts/header/Header";
import Footer from "@layouts/footer/Footer";
import Spinner from "@components/spinner/Spinner";
import AIChatWidget from "@components/chat/AIChatWidget";

// --- Main Component
const RootLayout = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCartFromDB());
      dispatch(fetchWishlistFromDB());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="flex flex-col w-full">
      <ScrollToTop />
      <div className="min-h-screen flex-1 flex flex-col">
        <Header />
        <main className="custom-container flex-1 flex flex-col">
          <Suspense
            fallback={
              <div className="flex-1 flex justify-center items-center">
                <Spinner />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
      <Footer />
      <AIChatWidget />
    </div>
  );
};

export default RootLayout;
