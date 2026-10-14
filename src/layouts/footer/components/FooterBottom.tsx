import { Link } from "react-router";
import { FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcApplePay } from "react-icons/fa";

// --- Main Component
const FooterBottom = () => {
  // --- CopyRight Date
  const date = new Date().getFullYear();

  // --- toTop Func
  const toTop = () => {
    window.scrollTo(0, 0);
  };

  // --- Return JSX
  return (
    <div className="bg-primary text-white">
      <div className="custom-container text-center py-6 text-2xl font-jetbrains flex flex-col items-center justify-center gap-3 select-none">
        <div onClick={toTop}>
          <Link
            to="/"
            aria-label="Go to Home Page"
            className="flex items-center lg:flex-col xl:flex-row max-lg:gap-2.5 xl:gap-3"
          >
            <span className="text-3xl font-bold font-jetbrains flex items-center text-shadow-neutral-700 text-shadow-2xs self-end">
              <span className="text-warning font-bold">Ba</span>
              <span className="text-white">ghdad</span>
              <span className="bg-warning w-2 h-2 rounded-full ml-1 mt-2.5 shadow-2xs shadow-neutral-700"></span>
            </span>
          </Link>
        </div>
        <p className="text-base md:text-lg font-jetbrains tracking-wider opacity-90">
          © {date} Parcelmind. All rights reserved.
        </p>
        <div className="flex items-center gap-3 text-4xl mt-2">
          <FaCcVisa className="text-blue-500 bg-white rounded px-1" />
          <FaCcMastercard className="text-red-500 bg-white rounded px-1" />
          <FaCcPaypal className="text-blue-400 bg-white rounded px-1" />
          <FaCcApplePay className="text-black bg-white rounded px-1" />
        </div>
      </div>
    </div>
  );
};

export default FooterBottom;
