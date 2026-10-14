// --- Libraries
import { Link } from "react-router";
import { MdEmail } from "react-icons/md";
import { STORE_CONFIG } from "@/config/storeConfig";

// --- Main Component
const TopFooter = () => {
  const toTop = () => {
    window.scrollTo(0, 0);
  };

  // --- Return JSX
  return (
    <div className="bg-primary text-white">
      <div className="flex max-md:flex-col items-center justify-between gap-5 custom-container py-5">
        {/* - Logo */}
        <div onClick={toTop}>
          <Link
            to="/"
            aria-label="Go to Home Page"
            className="flex items-center lg:flex-col xl:flex-row max-lg:gap-2.5 xl:gap-3"
          >
            <span className="text-3xl font-extrabold font-jetbrains tracking-tight flex items-center text-white">
              <span className="text-warning">{STORE_CONFIG.shortName}</span>
              <span className="bg-warning w-3 h-3 rounded-full ml-1 mt-2 shadow-2xs shadow-neutral-700"></span>
            </span>
          </Link>
        </div>
        {/* - Greeting */}
        <div className="max-md:flex max-md:flex-col max-md:items-center max-md:gap-2.5 text-[22px] sm:text-2xl font-bold tracking-tight text-warning font-jetbrains select-none">
          Always here to help you
          <a href={`mailto:${STORE_CONFIG.supportEmail}`} className="flex items-center gap-2.5 text-lg text-white">
            {STORE_CONFIG.supportEmail} <MdEmail />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopFooter;
