// --- Libraries
import { useState, useEffect } from "react";
import { Suspense } from "react";
import { Outlet } from "react-router";

// --- Components
import AdminHeader from "@pages/admin/AdminHeader";
import Sidebar from "@pages/admin/AdminSidebar";
import Spinner from "@components/spinner/Spinner";

// --- Utils
import { cn } from "@utils/cn";

// --- Main Component
const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-primary h-dvh overflow-hidden flex flex-col">
      <AdminHeader isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className={cn("flex-1 flex relative overflow-hidden")}>
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

        <main
          className={cn(
            "p-3 sm:p-5 h-full min-w-0 overflow-auto custom-scrollbar bg-[#F7F7F7] flex-1",
          )}
        >
          <Suspense
            fallback={
              <div className="flex-1 h-full flex justify-center items-center">
                <Spinner />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
