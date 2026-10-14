// --- Libraries
import { Link } from "react-router";
import { cn } from "@utils/cn";
import { STORE_CONFIG } from "@/config/storeConfig";

// --- Types
type LogoProps = React.ComponentProps<"div"> & {
  children?: React.ReactNode;
};

// --- Main Component
const Logo = ({ className, children }: LogoProps) => {
  return (
    <div>
      <Link
        to="/"
        aria-label="Go to Home Page"
        className={cn("flex items-center xl:flex-row gap-2.5 xl:gap-3", className)}
      >
        {children}
        <span className="text-2xl font-extrabold flex items-center tracking-tight text-shadow-neutral-700 text-shadow-2xs self-end">
          <span className="text-warning">{STORE_CONFIG.shortName}</span>
          <span className="bg-warning w-2.5 h-2.5 rounded-full ml-1 mt-2 shadow-2xs shadow-neutral-700"></span>
        </span>
      </Link>
    </div>
  );
};
export default Logo;
