// --- Libraries
import { Suspense } from "react";
import { Outlet } from "react-router";

// --- Components
import Spinner from "@components/spinner/Spinner";
import ScrollToTop from "@components/scroll-to-top/ScrollToTop";

// --- Main Component
const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-8 px-4">
      <ScrollToTop />

      {/* Main Form Center */}
      <main className="w-full flex items-center justify-center">
        <Suspense
          fallback={
            <div className="flex justify-center items-center">
              <Spinner />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default AuthLayout;
