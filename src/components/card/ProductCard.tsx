// --- Libraries
import { Link } from "react-router";
import { useState } from "react";

// --- React Icons
import { FaShoppingCart, FaHeart, FaRegHeart } from "react-icons/fa";

// --- Types
import type { ProductType } from "@/types/types";

// --- Utils
import { getOptimizedImageUrl } from "@utils/optimizeImage";
import { formatCurrency } from "@utils/formatCurrency";
import { cn } from "@utils/cn";

// --- Local Components
import RatingAndViews from "@components/card/components/rating-and-reviews/RatingAndReviews";

// --- RTK
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { addToCart } from "@features/cart/cartSlice";
import { addToWishlist, removeFromWishlist } from "@features/wishlist/wishlistSlice";

// --- Types
type ProductCardProps = Omit<React.HTMLAttributes<HTMLDivElement>, "id"> & {
  product: ProductType;
};

// --- Main Component
const ProductCard = ({ className, product, ...rest }: ProductCardProps) => {
  const { _id, category, images, title, description, reviewsCount, rating, price, priceAfterDiscount, stock = 0 } = product;
  const isSoldOut = stock <= 0;
  
  // Local state for quantity selector
  const [quantity, setQuantity] = useState(1);

  // --- RTK
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const isSaved = wishlistItems.some((item) => item._id === _id);

  // Discount Calculation
  const discountPercentage = 
    price && priceAfterDiscount && price > priceAfterDiscount
      ? Math.round(((price - priceAfterDiscount) / price) * 100)
      : 0;

  // --- Handlers
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;
    dispatch(
      addToCart({
        productId: _id,
        title,
        image: images[0]?.url || "",
        price: priceAfterDiscount,
        count: quantity,
        stock: product.stock,
        category,
      }),
    );
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (isSaved) {
      dispatch(removeFromWishlist(_id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // --- Return JSX
  return (
    <div
      className={cn(
        "group relative bg-white w-full max-w-[320px] flex flex-col rounded-xl shadow-soft hover:shadow-deep transition-all duration-300 overflow-hidden select-none",
        className,
      )}
      data-testid="product-card"
      {...rest}
    >
      <div className="flex flex-col flex-grow">
        {/* Top Image Section */}
        <Link
          to={`/products/${category}/${_id}`}
          className="relative aspect-square bg-[#e8eedd] flex items-center justify-center p-6 overflow-hidden block"
        >
          {/* Background Brand Text (Optional, like 'NIKE' in the example) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
             <span className="text-7xl font-black uppercase tracking-widest leading-none text-black break-all text-center">
               {category ? category.substring(0, 4) : "SHOP"}
             </span>
          </div>

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-4 left-4 z-10 bg-[#f43f5e] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              -{discountPercentage}%
            </div>
          )}

          {/* Wishlist Button */}
          <div className="absolute top-4 right-4 z-10 group/heart" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <button
              type="button"
              aria-label={isSaved ? `Remove ${title} from saved` : `Save ${title} for later`}
              onClick={handleWishlistToggle}
              disabled={!isAuthenticated}
              className="flex items-center justify-center w-9 h-9 bg-white rounded-full shadow-sm hover:shadow-md text-gray-700 transition-all"
            >
              {isSaved ? <FaHeart className="text-[#f43f5e]" /> : <FaRegHeart />}
            </button>
            {!isAuthenticated && (
              <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/heart:opacity-100 transition-opacity pointer-events-none">
                Login to save
              </span>
            )}
          </div>

          {/* Product Image */}
          <img
            src={getOptimizedImageUrl(images[0]?.url, 400)}
            alt={title}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400";
            }}
            className="w-full h-full object-contain relative z-10 transition-transform duration-500 ease-in-out group-hover:scale-105 group-hover:-rotate-3 drop-shadow-xl"
          />

          {/* Quick View Button (Hover) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-105 active:scale-95 cursor-pointer block">
             <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-5 py-2 rounded-full shadow-md border border-gray-100/50 block">
               View Details
             </span>
          </div>

          {/* Sold Out Overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20 backdrop-blur-[2px]">
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded shadow-md tracking-widest uppercase">
                Sold Out
              </span>
            </div>
          )}
        </Link>

        {/* Bottom Details Section */}
        <div className="p-5 flex flex-col flex-grow bg-white">
          <p className="text-[10px] font-bold text-[#8a9b4f] tracking-widest uppercase mb-1">
            {category}
          </p>
          <Link to={`/products/${category}/${_id}`} className="hover:text-warning transition-colors duration-200">
            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-1">
              {title}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2 min-h-[36px]">
            {description || "Premium quality product designed for everyday comfort and modern style."}
          </p>
          
          <div className="mb-4">
             <RatingAndViews rating={rating} reviews={reviewsCount} />
          </div>

          <div className="mt-auto flex items-end gap-2 mb-5">
            <span className="text-2xl font-black text-gray-900 leading-none">
              {formatCurrency(priceAfterDiscount)}
            </span>
            {discountPercentage > 0 && (
              <span className="text-sm font-medium text-gray-400 line-through leading-none mb-1">
                {formatCurrency(price)}
              </span>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3">
            {/* Quantity Selector */}
            <div 
              className="flex items-center justify-between bg-[#f1f5f9] rounded-xl px-2 py-1.5 w-24 h-11"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <button 
                type="button"
                className="w-7 h-7 flex items-center justify-center text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                onClick={handleDecrement}
                disabled={quantity <= 1 || isSoldOut}
              >
                -
              </button>
              <span className="text-sm font-bold text-gray-900 w-4 text-center select-text">
                {quantity}
              </span>
              <button 
                type="button"
                className="w-7 h-7 flex items-center justify-center text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                onClick={handleIncrement}
                disabled={quantity >= stock || isSoldOut}
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              aria-label={`Add ${title} to cart`}
              onClick={handleAddToCart}
              disabled={isSoldOut}
              className={cn(
                "flex-grow h-11 flex items-center justify-center gap-2 text-sm font-bold rounded-xl shadow-md transition-all duration-200",
                isSoldOut
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                  : "bg-[#81b238] text-white hover:bg-[#6c982b] active:scale-[0.98]"
              )}
            >
              <FaShoppingCart />
              {isSoldOut ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
