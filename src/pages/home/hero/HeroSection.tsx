// --- Local Components
import Offers from "@pages/home/hero/components/Offers";
import Sellers from "@pages/home/hero/components/Sellers";
import Category from "@pages/home/hero/components/Category";

// --- Main Component
const HeroSection = () => {
  // --- Return JSX
  return (
    <div className="mt-5">
      {/* Hero Section Offers */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-10 gap-5 mb-10">
        <div className="lg:col-span-7">
          <Offers />
        </div>

        <div className="lg:col-span-3">
          <Sellers />
        </div>
      </section>
      {/* Hero Section Categories */}
      <Category />
    </div>
  );
};
export default HeroSection;
