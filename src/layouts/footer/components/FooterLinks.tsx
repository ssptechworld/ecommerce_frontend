// --- Libraries
import { Link } from "react-router";

// --- Types
type FooterLinkItem = {
  label: string;
  to: string;
};

type FooterLinksProps = {
  title: string;
  productsLink: FooterLinkItem[];
};

// --- Main Component
const FooterLinks = ({ title, productsLink }: FooterLinksProps) => {
  return (
    <div className="mx-auto w-50">
      <h3 className="text-xl text-warning font-jetbrains tracking-tight font-bold w-fit mx-auto border-b-2 border-b-warning-500 pb-0.5 select-none">
        {title}
      </h3>
      <ul className="pt-5 flex flex-col gap-1">
        {productsLink.map((item) => (
          <li
            key={item.label}
            className="border-b border-b-transparent hover:border-b-warning pb-0.5 w-fit transition-colors duration-150 select-none"
          >
            <Link to={item.to} aria-label={`Go to ${item.label}`}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FooterLinks;

