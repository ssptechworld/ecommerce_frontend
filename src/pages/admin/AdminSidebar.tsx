// --- Libraries
import { NavLink, type NavLinkProps } from "react-router";
import { MdOutlineAddToPhotos, MdOutlineDashboard } from "react-icons/md";
import { IoListSharp } from "react-icons/io5";
import { BiBasket } from "react-icons/bi";
import { FiLogOut, FiUsers } from "react-icons/fi";
import { TbPackageImport } from "react-icons/tb";

// --- RTK
import { useAppDispatch } from "@app/hooks";
import { logout } from "@features/auth/authSlice";

// --- Utili
import { cn } from "@utils/cn";

// --- Components
import CustomButton from "@components/custom-button/CustomButton";

// --- Types
type CustomNavLinkProps = NavLinkProps & {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
};

// --- Main Component
const CustomNavLink = ({ to, children, onClick, ...rest }: CustomNavLinkProps) => {
  return (
    <li>
      <NavLink
        to={to}
        onClick={onClick}
        {...rest}
        className={({ isActive }) =>
          cn(
            "flex items-center py-1.5 px-2.5 rounded-sm gap-2.5",
            isActive
              ? "bg-amber-400 text-primary shadow-lg shadow-amber-500/20"
              : "text-gray-400 hover:bg-white/5 hover:text-white",
          )
        }
      >
        {children}
      </NavLink>
    </li>
  );
};

type SidebarTypeProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar = ({ isOpen, setIsOpen }: SidebarTypeProps) => {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        return e.target === e.currentTarget ? setIsOpen(false) : "";
      }}
      className={cn(
        "border-t border-t-[#d5d5d5]/25",
        isOpen
          ? "max-md:fixed max-md:inset-0 max-md:top-[64px] max-md:bg-black/50 z-40 transition-all duration-300"
          : "",
      )}
    >
      <aside
        className={cn(
          "relative w-[260px] sm:w-[288px] shrink-0 p-6 sm:p-10 bg-primary text-white flex flex-col z-50 overflow-y-auto custom-scrollbar",
          "transition-all duration-300 ease-in-out",
          "max-md:absolute max-md:top-0 max-md:left-0 h-full",
          isOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
          isOpen ? "md:ml-0" : "md:-ml-[260px] sm:md:-ml-[288px]",
        )}
      >
        <nav className="flex-1">
          <ul className="flex flex-col text-base sm:text-lg gap-2">
            <CustomNavLink to="/admin" end onClick={handleLinkClick}>
              <MdOutlineDashboard />
              Dashboard
            </CustomNavLink>

            <CustomNavLink to="add-product" onClick={handleLinkClick}>
              <MdOutlineAddToPhotos />
              Add Product
            </CustomNavLink>

            <CustomNavLink to="import-product" onClick={handleLinkClick}>
              <TbPackageImport />
              Import from Seller
            </CustomNavLink>

            <CustomNavLink to="products" onClick={handleLinkClick}>
              <IoListSharp />
              Product List
            </CustomNavLink>

            <CustomNavLink to="orders" onClick={handleLinkClick}>
              <BiBasket />
              Orders
            </CustomNavLink>

            <CustomNavLink to="users" onClick={handleLinkClick}>
              <FiUsers />
              Users
            </CustomNavLink>
          </ul>
        </nav>

        <CustomButton
          onClick={handleLogout}
          className="mt-6 bg-red-500 text-white w-full flex items-center justify-center gap-2.5 hover:bg-red-600 active:bg-red-500 shrink-0"
        >
          <FiLogOut /> Logout
        </CustomButton>
      </aside>
    </div>
  );
};

export default Sidebar;
