// --- React Icons
import { FaRegUser, FaHeart } from "react-icons/fa";
import { BsBox2 } from "react-icons/bs";

// --- React Router
import { NavLink, Outlet } from "react-router";

// --- Utils
import { cn } from "@utils/cn";

// --- RTK
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { logout } from "@features/auth/authSlice";

// --- Local Components
import CustomButton from "@components/custom-button/CustomButton";

// --- Main Component
const ProfileLayout = () => {
  // --- RTK
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // --- Handle Logout
  const handleLogout = () => {
    if (isAuthenticated) dispatch(logout());
  };

  // --- Return JSX
  return (
    <div className="grid grid-cols-4 gap-5 my-5">
      {/* Left Side */}
      <div className="col-span-4 h-fit md:col-span-1 bg-white rounded-md overflow-hidden shadow-soft flex flex-col sm:flex-row md:flex-col md:gap-2.5">
        <ul className="md:border-b border-[#D4D4D6] max-lg:text-[12px] flex flex-wrap sm:flex-nowrap md:flex-col flex-1 overflow-x-auto">
          <li className="shrink-0">
            <NavLink
              to="/profile"
              end
              className={({ isActive }) =>
                cn("flex items-center gap-2.5 p-2.5 whitespace-nowrap", isActive ? "bg-[#D4D4D6]" : "bg-white hover:bg-body")
              }
            >
              <FaRegUser />
              My Account Overview
            </NavLink>
          </li>
          <li className="shrink-0">
            <NavLink
              to="orders"
              className={({ isActive }) =>
                cn("flex items-center gap-2.5 p-2.5 whitespace-nowrap", isActive ? "bg-[#D4D4D6]" : "bg-white hover:bg-body")
              }
            >
              <BsBox2 />
              Orders
            </NavLink>
          </li>
          <li className="shrink-0">
            <NavLink
              to="saved"
              className={({ isActive }) =>
                cn("flex items-center gap-2.5 p-2.5 whitespace-nowrap", isActive ? "bg-[#D4D4D6]" : "bg-white hover:bg-body")
              }
            >
              <FaHeart className="text-red-400" />
              Saved Items
            </NavLink>
          </li>
        </ul>
        <CustomButton
          onClick={handleLogout}
          className="max-md:h-9.5 rounded-none px-4 max-lg:text-[14px] max-md:active:scale-[1] md:rounded-md md:my-5 md:w-7/10 md:mx-auto shrink-0"
        >
          Logout
        </CustomButton>
      </div>

      {/* Right Side */}
      <div className="col-span-4 md:col-span-3 md:min-h-150 bg-white rounded-md overflow-hidden shadow-soft">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout;
