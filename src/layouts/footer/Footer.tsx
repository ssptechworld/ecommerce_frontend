// --- Local Components
import FooterTop from "@layouts/footer/components/FooterTop";
import FooterMiddle from "@layouts/footer/components/FooterMiddle";
import FooterExtra from "@layouts/footer/components/FooterExtra";
import FooterBottom from "@layouts/footer/components/FooterBottom";

// --- Main Component
const Footer = () => {
  return (
    <footer>
      <FooterTop />
      <FooterMiddle />
      <FooterExtra />
      <FooterBottom />
    </footer>
  );
};

export default Footer;
