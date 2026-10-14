// --- Local Component
import FooterLinks from "@layouts/footer/components/FooterLinks";

// ------ Products Link Arrays
const electronics = [
  { label: "All Electronics", to: "/electronics" },
  { label: "Mobiles", to: "/electronics?tab=mobiles" },
  { label: "Laptops", to: "/electronics?tab=laptops" },
];

const fashion = [
  { label: "Men's Fashion", to: "/men" },
  { label: "Men's Shoes", to: "/men?tab=shoes" },
  { label: "Men's Clothing", to: "/men?tab=clothing" },
  { label: "Women's Fashion", to: "/women" },
  { label: "Handbags", to: "/women?tab=handbags" },
  { label: "Dresses", to: "/women?tab=dresses" },
];

const homeAndKitchen = [
  { label: "All Kitchen", to: "/kitchen" },
  { label: "Cookware", to: "/kitchen?tab=cookware" },
  { label: "Appliances", to: "/kitchen?tab=appliances" },
];

const beauty = [
  { label: "Supermarket", to: "/supermarket" },
  { label: "Automotive", to: "/automotive" },
];

// --- Main Component
const MiddleFooter = () => {
  return (
    <div className="bg-primary/80 text-white">
      <div className="custom-container py-5 grid grid-cols-1 sm:grid-cols-2 gap-5 xxl:grid-cols-4">
        {/* Electronics */}
        <FooterLinks title={"Electronics"} productsLink={electronics} />

        {/* Fashion */}
        <FooterLinks title={"Fashion"} productsLink={fashion} />

        {/* Home & Kitchen */}
        <FooterLinks title={"Home & Kitchen"} productsLink={homeAndKitchen} />

        {/* More */}
        <FooterLinks title={"More"} productsLink={beauty} />
      </div>
    </div>
  );
};

export default MiddleFooter;
