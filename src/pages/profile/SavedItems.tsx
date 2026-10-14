// --- Libraries
import { Link } from "react-router";

// --- React Icons
import { FaHeart, FaTrash } from "react-icons/fa";
import { GrCart } from "react-icons/gr";
import { BsHeartbreak } from "react-icons/bs";

// --- RTK
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { removeFromWishlist } from "@features/wishlist/wishlistSlice";
import { addToCart } from "@features/cart/cartSlice";

// --- Utils
import { getOptimizedImageUrl } from "@utils/optimizeImage";
import { formatCurrency } from "@utils/formatCurrency";

// --- Main Component
const SavedItems = () => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.wishlist);

  // --- Handle Add to Cart
  const handleAddToCart = (product: (typeof items)[number]) => {
    dispatch(
      addToCart({
        productId: product._id,
        title: product.title,
        image: product.images[0]?.url || "",
        price: product.priceAfterDiscount,
        count: 1,
        category: product.category,
      }),
    );
  };

  // --- Empty State
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-20 px-5 text-center">
        <BsHeartbreak className="text-6xl text-gray-300" />
        <h2 className="text-2xl font-bold text-primary font-jetbrains">No Saved Items Yet</h2>
        <p className="text-gray-500 max-w-sm">
          Items you save for later will appear here. Browse the store and click the ♥ icon to save products.
        </p>
        <Link
          to="/"
          className="mt-2 bg-warning text-primary px-6 py-2 rounded-md font-bold hover:bg-amber-300 transition-colors duration-150"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  // --- Return JSX
  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 border-b pb-3">
        <FaHeart className="text-red-500 text-xl" />
        <h2 className="text-xl font-bold text-primary font-jetbrains">Saved Items ({items.length})</h2>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((product) => (
          <div
            key={product._id}
            className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col"
          >
            {/* Product Image */}
            <Link
              to={`/products/${product.category}/${product._id}`}
              className="block w-full h-44 overflow-hidden bg-gray-50"
              aria-label={`View ${product.title}`}
            >
              <img
                src={getOptimizedImageUrl(product.images[0]?.url, 400)}
                alt={product.title}
                loading="lazy"
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </Link>

            {/* Product Info */}
            <div className="p-3 flex flex-col gap-2 flex-1">
              <Link
                to={`/products/${product.category}/${product._id}`}
                className="font-medium text-primary line-clamp-2 hover:text-amber-600 transition-colors duration-150 text-sm"
              >
                {product.title}
              </Link>
              <span className="text-lg font-bold text-primary">{formatCurrency(product.priceAfterDiscount)}</span>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-auto pt-2">
                <button
                  type="button"
                  aria-label={`Add ${product.title} to cart`}
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 flex items-center justify-center gap-2 bg-warning text-primary py-1.5 rounded-md font-semibold text-sm hover:bg-amber-300 active:scale-[0.98] transition-all duration-150 cursor-pointer"
                >
                  <GrCart className="text-base" />
                  Add to Cart
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${product.title} from saved items`}
                  onClick={() => dispatch(removeFromWishlist(product._id))}
                  className="flex items-center justify-center w-9 h-9 rounded-md border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-400 active:scale-[0.97] transition-all duration-150 cursor-pointer"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedItems;
