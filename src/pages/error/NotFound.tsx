// Libraries
import { Link } from "react-router";

// Main Component
const NotFound = () => {
  return (
    <div className="container m-auto flex flex-col justify-center items-center text-center grow">
      <h1 className="text-[100px] sm:text-[150px] md:text-[200px] text-black font-bold leading-none">404</h1>
      <p className="text-2xl sm:text-4xl md:text-5xl mb-7 mt-2">Page Not Found</p>
      <Link
        to="/"
        aria-label="Go to Home Page"
        replace={true}
        className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600 text-[13px] sm:text-[14px]"
      >
        Looks like you've reached to non—existent page. <br />
        How about going back to safety?
      </Link>
    </div>
  );
};

export default NotFound;
