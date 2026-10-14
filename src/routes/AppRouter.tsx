// --- Libraries
import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

// --- Local Components
import ProtectedRoute from "@components/protected-route/ProtectedRoute";
import PublicRoute from "@components/public-route/PublicRoute";

// --- Layouts
import RootLayout from "@layouts/RootLayout";
import AuthLayout from "@layouts/AuthLayout";

// --- Pages
import Home from "@pages/home/Home";
import NotFound from "@pages/error/NotFound";

// --- Lazy Loading Pages

// - Public Pages
const Electronics = lazy(() => import("@pages/electronics/Electronics"));
const Men = lazy(() => import("@pages/men/Men"));
const Women = lazy(() => import("@pages/women/Women"));
const Kitchen = lazy(() => import("@pages/kitchen/Kitchen"));
const Supermarket = lazy(() => import("@pages/supermarket/Supermarket"));
const Automotive = lazy(() => import("@pages/automotive/Automotive"));
const ProductDetails = lazy(() => import("@pages/product-details/ProductDetails"));
const Cart = lazy(() => import("@pages/cart/Cart"));
const BecomeSalesPartner = lazy(() => import("@pages/partner/BecomeSalesPartner"));

// - Auth Pages
const Login = lazy(() => import("@pages/auth/Login"));
const Register = lazy(() => import("@pages/auth/Register"));
const ResetPassword = lazy(() => import("@pages/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("@pages/auth/VerifyEmail"));
const ResetPasswordConfirm = lazy(() => import("@pages/auth/ResetPasswordConfirm"));
const AuthCallback = lazy(() => import("@pages/auth/AuthCallback"));

// - Profile Pages
const ProfileLayout = lazy(() => import("@pages/profile/ProfileLayout"));
const AccountOverview = lazy(() => import("@pages/profile/AccountOverview"));
const CustomerOrders = lazy(() => import("@pages/profile/CustomerOrders"));
const AddressBookEdit = lazy(() => import("@pages/profile/AddressBookEdit"));
const AccountDetailsEdit = lazy(() => import("@pages/profile/AccountDetailsEdit"));
const Checkout = lazy(() => import("@pages/checkout/Checkout"));
const SavedItems = lazy(() => import("@pages/profile/SavedItems"));

// - Admin Pages
const AdminLayout = lazy(() => import("@pages/admin/AdminLayout"));
const Dashboard = lazy(() => import("@pages/admin/Dashboard"));
const ProductsList = lazy(() => import("@pages/admin/ProductsList"));
const Orders = lazy(() => import("@pages/admin/Orders"));
const Users = lazy(() => import("@pages/admin/Users"));
const UserEditPage = lazy(() => import("@pages/admin/UserEditPage"));
const AddProduct = lazy(() => import("@pages/admin/AddProduct"));
const ImportProduct = lazy(() => import("@pages/admin/ImportProduct"));

//--- Router
const router = createBrowserRouter([
  // --- Main Storefront Routes (With Header, Search & Footer)
  {
    path: "/",
    Component: RootLayout,
    children: [
      // --- Public Pages
      { index: true, Component: Home },
      { path: "electronics", Component: Electronics },
      { path: "kitchen", Component: Kitchen },
      { path: "supermarket", Component: Supermarket },
      { path: "automotive", Component: Automotive },
      { path: "men", Component: Men },
      { path: "women", Component: Women },
      { path: "become-partner", Component: BecomeSalesPartner },
      { path: "products/:category/:id", Component: ProductDetails },

      // - Protected Customer Routes
      {
        element: <ProtectedRoute />,
        children: [
          { path: "cart", Component: Cart },
          {
            path: "profile",
            Component: ProfileLayout,
            children: [
              { index: true, Component: AccountOverview },
              { path: "orders", Component: CustomerOrders },
              { path: "saved", Component: SavedItems },
              { path: "address/edit", Component: AddressBookEdit },
              { path: "account/edit", Component: AccountDetailsEdit },
            ],
          },
          // - Checkout
          { path: "checkout", Component: Checkout },
        ],
      },
      // --- NotFound Page
      { path: "*", Component: NotFound },
    ],
  },

  // --- Dedicated Standalone Auth Routes (Without Marketplace Header/Search)
  {
    element: <PublicRoute />,
    children: [
      {
        Component: AuthLayout,
        children: [
          { path: "login", Component: Login },
          { path: "register", Component: Register },
          { path: "reset-password", Component: ResetPassword },
          { path: "auth/callback", Component: AuthCallback },
          { path: "auth/:id/verify/:token", Component: VerifyEmail },
          { path: "users/:id/verify/:token", Component: VerifyEmail },
          { path: "password/reset-password/:userId/:token", Component: ResetPasswordConfirm },
        ],
      },
    ],
  },

  // - Admin Routes
  {
    element: <ProtectedRoute adminOnly={true} />,
    children: [
      {
        path: "admin",
        Component: AdminLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: "products", Component: ProductsList },
          { path: "add-product", Component: AddProduct },
          { path: "import-product", Component: ImportProduct },
          { path: "products/edit/:category/:id", Component: AddProduct },
          { path: "orders", Component: Orders },
          { path: "users", Component: Users },
          { path: "users/edit/:id", Component: UserEditPage },
          // --- NotFound Page
          { path: "*", Component: NotFound },
        ],
      },
    ],
  },
]);

// --- Main Component
const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
