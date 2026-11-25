// --- Libraries
import { Link } from "react-router";
import toast from "react-hot-toast";

// --- React Icons
import { MdOutlineDeleteOutline } from "react-icons/md";
import { HiPlus } from "react-icons/hi";
import { HiMinus } from "react-icons/hi";

// Utils
import { formatCurrency } from "@utils/formatCurrency";

// --- Local Files
import { useAppDispatch } from "@app/hooks";

// --- Types
import type { CartType } from "@/types/types";

// --- Redux Features
import { decreaseQuantity, increaseQuantity, removeFromCart } from "@features/cart/cartSlice";

// --- Main Component
const CartProduct = (product: CartType) => {
  const dispatch = useAppDispatch();

  // --- Cart Logic
  const increaseQuantityFunc = (id: string) => {
    if (product.stock !== undefined && product.count >= product.stock) {
      toast.error(`Only ${product.stock} items available in stock.`);
      return;
    }
    dispatch(increaseQuantity(id));
  };
  const decreaseQuantityFunc = (id: string) => {
    if (product.count === 1) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(decreaseQuantity(id));
    }
  };
  const removeFromCartFunc = (id: string) => {
    dispatch(removeFromCart(id));
  };

  //--- Return JSX
  return (
    <div className="relative flex flex-col sm:flex-row justify-between gap-4 border-b-2 border-b-body last:border-b-0 w-[97.5%] mx-auto p-3">
      {/* Cart Product Left */}
      <div className="flex flex-col gap-3 sm:gap-5 w-full sm:w-3/5 xl:w-3/4 min-w-0">
        {/* ---- Cart Left Details */}
        <Link to={`/products/${product.category}/${product.productId}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-16 h-16 sm:w-18 sm:h-18 shrink-0">
              <img
                src={product.image}
                alt={product.title}
                loading="eager"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).onerror = null;
                  (e.currentTarget as HTMLImageElement).src = "/logo.svg";
                }}
              />
            </div>
            <div className="min-w-0">
              <h4 className="font-light line-clamp-2">{product.title}</h4>
            </div>
          </div>
        </Link>
        {/* ---- Cart Left Remove */}
        <button
          type="button"
          aria-label="Remove from cart"
          onClick={() => removeFromCartFunc(product.productId)}
          className="text-warning flex items-center gap-1 font-medium cursor-pointer hover:bg-amber-400 hover:text-white w-fit p-1 pr-1.5 rounded-sm transition-colors duration-150"
        >
          <MdOutlineDeleteOutline className="text-xl" />
          Remove
        </button>
      </div>
      {/* Cart Product Right */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-5 w-full sm:w-2/5 xl:w-1/4 shrink-0">
        {/* --- Price */}
        <div className="flex flex-col sm:items-end gap-1.5">
          <div className="text-[16px] sm:text-lg font-medium">{formatCurrency(product.price)}</div>
        </div>
        {/* --- Controllers */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <button
            type="button"
            aria-label="Decrease Quantity by 1"
            onClick={() => decreaseQuantityFunc(product.productId)}
            className="bg-warning w-fit h-fit p-2 rounded-sm shadow-standard flex items-center justify-center select-none cursor-pointer hover:bg-amber-400 active:bg-warning active:scale-[0.99] transition-all duration-75 font-medium"
          >
            <HiMinus className="max-sm:text-[12px]" />
          </button>
          <span className="text-base sm:text-lg font-medium w-10 sm:w-15 text-center border">{product.count}</span>
          <button
            type="button"
            aria-label="Increase Quantity by 1"
            onClick={() => increaseQuantityFunc(product.productId)}
            className="bg-warning w-fit h-fit p-2 rounded-sm shadow-standard flex items-center justify-center select-none cursor-pointer hover:bg-amber-400 active:bg-warning active:scale-[0.99] transition-all duration-75 font-medium"
          >
            <HiPlus className="max-sm:text-[12px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartProduct;
