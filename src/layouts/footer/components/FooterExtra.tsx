// --- Libraries
import { Link } from "react-router";

// --- React Icons
import { MdEmail } from "react-icons/md";
import { FaPaperPlane, FaShieldAlt, FaHeadset, FaGlobe, FaStar } from "react-icons/fa";

// --- Main Component
const FooterExtra = () => {
  return (
    <div className="w-full flex flex-col">
      {/* Newsletter Section */}
      <div className="bg-[#e9e3f4] text-gray-800 py-8">
        <div className="custom-container flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">Sign up to our news & offers</h3>
            <p className="text-sm text-gray-600">Be the first to know about exclusive offers, new services, couriers, tools and more!</p>
          </div>
          <div className="flex-1 w-full max-w-md flex">
            <div className="relative flex-grow">
              <input 
                type="email" 
                placeholder="email@address.com" 
                className="w-full h-full py-3 px-4 pl-10 border-0 outline-none"
              />
              <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            </div>
            <button className="bg-[#12b981] hover:bg-emerald-600 text-white px-6 py-3 font-semibold flex items-center gap-2 transition-colors">
              <FaPaperPlane className="hidden sm:block" /> Sign up
            </button>
          </div>
        </div>
      </div>

      {/* Links & Brand Section */}
      <div className="bg-[#f8f8f8] text-gray-800 py-10">
        <div className="custom-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Trustpilot */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-3xl font-bold tracking-tight">
              <span className="text-[#a57962]">el</span>monkey
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-800 font-bold mb-1">Trustpilot</p>
              <div className="flex items-center gap-1 text-2xl mb-1 text-[#00b67a]">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar className="text-gray-300" />
              </div>
              <p className="text-xs text-gray-500">4.0 | 9,200 reviews</p>
            </div>
          </div>
          
          {/* Company */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-primary mb-1">Company</h4>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">About us</Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">Reviews</Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">Privacy policy</Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">Cookie policy</Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">Terms & conditions</Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">Acceptable use policy</Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">Sitemap</Link>
          </div>

          {/* Shipping Services */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-primary mb-1">Shipping services</h4>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">Ship a package</Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">Track a package</Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">Domestic shipping</Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">International shipping</Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">Bulk shipping</Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">Couriers</Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">Delivery services</Link>
          </div>

          {/* Customers */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-primary mb-1">Customers</h4>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">Log in</Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">Register</Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">Contact us</Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">Support hub</Link>
            <Link to="#" className="text-sm text-gray-600 hover:text-primary">Preferences</Link>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-white text-gray-800 py-6 border-t border-gray-200">
        <div className="custom-container grid grid-cols-2 lg:grid-cols-4 gap-6 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <FaGlobe className="text-2xl text-purple-800" />
            </div>
            <p className="text-xs font-bold text-purple-900 tracking-wide uppercase leading-tight">Shipping to<br/>over 200 countries</p>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <FaShieldAlt className="text-2xl text-purple-800" />
            </div>
            <p className="text-xs font-bold text-purple-900 tracking-wide uppercase leading-tight">100% Secure<br/>Checkout</p>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <FaHeadset className="text-2xl text-purple-800" />
            </div>
            <p className="text-xs font-bold text-purple-900 tracking-wide uppercase leading-tight">Outstanding<br/>Worldwide Support</p>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <FaStar className="text-2xl text-purple-800" />
            </div>
            <p className="text-xs font-bold text-purple-900 tracking-wide uppercase leading-tight">Over 9,000<br/>Genuine Reviews</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterExtra;
