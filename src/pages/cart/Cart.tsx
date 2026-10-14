// --- Libraries
import { Link } from "react-router";

// --- React Icons
import { GrCart } from "react-icons/gr";
import { FaLock } from "react-icons/fa";

// --- Local Files
import { useAppSelector } from "@app/hooks";

// --- Local Components
import EmptyState from "@components/empty-state/EmptyState";
import CartProduct from "@pages/cart/components/CartProduct";
import CartSummary from "@pages/cart/components/CartSummary";

// --- Main Component
const Cart = () => {
  const { cart } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // --- Login Gate for Guests
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 px-5 text-center my-10">
        <div className="relative">
          <GrCart className="text-7xl text-gray-300" />
          <FaLock className="absolute -bottom-1 -right-1 text-xl text-amber-500 bg-white rounded-full p-0.5" />
        </div>
        <h2 className="text-2xl font-bold text-primary font-jetbrains">Login to View Your Cart</h2>
        <p className="text-gray-500 max-w-md">
          Sign in or create an account to access your cart and proceed to checkout. Any items you've added will be
          waiting for you!
        </p>
        <div className="flex items-center gap-4 mt-2">
          <Link
            to="/login"
            className="bg-warning text-primary px-8 py-2.5 rounded-md font-bold hover:bg-amber-300 transition-colors duration-150 text-lg"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="border-2 border-primary text-primary px-8 py-2.5 rounded-md font-bold hover:bg-primary hover:text-white transition-colors duration-150 text-lg"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  // --- Empty Cart
  if (cart.length === 0) {
    return <EmptyState title={"Your cart is empty!"} desc={"Browse our categories and discover our best deals!"} />;
  }

  // --- Cart total calculations
  const totalItems = cart.reduce((acc, cur) => acc + cur.count, 0);

  // --- Return JSX
  return (
    <div className="my-5 grid grid-cols-5 xl:grid-cols-4 max-lg:gap-3 gap-5">
      {/* Cart Products */}
      <div className="max-md:order-last col-span-5 md:col-span-3 xl:col-span-3 bg-white rounded-md">
        <h3 className="p-3 text-2xl border-b-2 border-b-body text-neutral-700 font-jetbrains select-none">
          CART({totalItems})
        </h3>
        <div>
          {cart.map((product) => (
            <CartProduct {...product} key={product.productId} />
          ))}
        </div>
      </div>
      {/* Cart Summary */}
      <CartSummary />
    </div>
  );
};

export default Cart;

