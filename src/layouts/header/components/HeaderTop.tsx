// --- React Icons
import { GiHamburgerMenu } from "react-icons/gi";
import { FaPhoneAlt } from "react-icons/fa";

// --- Local Components
import Logo from "@components/logo/Logo";

// --- Images
import logo from "/logo.svg";

import { STORE_CONFIG } from "@/config/storeConfig";

// --- Types
type HeaderTopProps = {
  handleToggle: () => void;
  children: React.ReactNode;
};

// --- Main Component
const HeaderTop = ({ handleToggle, children }: HeaderTopProps) => {
  return (
    <div className="flex items-center lg:items-end justify-between gap-3 xl:gap-5 py-2.5 max-sm:py-5 z-50">
      <div className="flex items-center gap-2.5 sm:gap-5">
        <button
          type="button"
          aria-label="Open Menu"
          className="text-white max-sm:text-3xl text-4xl lg:hidden"
          onClick={handleToggle}
        >
          <GiHamburgerMenu />
        </button>
        {/* --- Logo */}
        <Logo>
          <div className="w-10 lg:w-12.5 max-sm:hidden">
            <img src={logo} alt="Logo" loading="lazy" className="object-contain select-none" draggable={false} />
          </div>
        </Logo>
      </div>
      {/* Header NavBar */}
      {children}
      {/* Header Head Telephone */}
      <div className="max-sm:hidden flex items-center gap-2.5 text-white text-sm font-medium tracking-wide">
        <FaPhoneAlt size={14} className="text-amber-400" />
        {STORE_CONFIG.supportPhone}
      </div>
    </div>
  );
};

export default HeaderTop;
