export interface StoreConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  supportEmail: string;
  supportPhone: string;
  address: {
    street: string;
    city: string;
    country: string;
    zip: string;
  };
  currency: {
    code: string;
    symbol: string;
  };
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  features: {
    enableWishlist: boolean;
    enableCart: boolean;
    enableReviews: boolean;
    enableAiAssistant: boolean;
    enableShippingLabels: boolean;
    enableInvoices: boolean;
    enableTrackingMessages: boolean;
  };
}

export const STORE_CONFIG: StoreConfig = {
  name: "Nexus E-Commerce Platform",
  shortName: "Nexus Store",
  tagline: "Premium Global Retail & Digital Shopping Marketplace",
  description: "Your premier destination for electronics, fashion, home essentials, and lifestyle products.",
  supportEmail: "support@nexusstore.com",
  supportPhone: "+1 (800) 555-0199",
  address: {
    street: "100 Innovation Boulevard, Tech Park",
    city: "Global Logistics Hub",
    country: "International",
    zip: "90210",
  },
  currency: {
    code: "USD",
    symbol: "$",
  },
  socialLinks: {
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
  },
  features: {
    enableWishlist: true,
    enableCart: true,
    enableReviews: true,
    enableAiAssistant: true,
    enableShippingLabels: true,
    enableInvoices: true,
    enableTrackingMessages: true,
  },
};
