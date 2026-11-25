// --- Libraries
import { Link } from "react-router";

// --- React Icons
import { GrCart } from "react-icons/gr";
import { FaHeart, FaRegHeart } from "react-icons/fa";

// --- Types
import type { ProductType } from "@/types/types";

// --- Local Components
import Discount from "@components/card/components/discount/Discount";
import RatingAndViews from "@components/card/components/rating-and-reviews/RatingAndReviews";

// --- Utils
import { cn } from "@utils/cn";
import { getOptimizedImageUrl } from "@utils/optimizeImage";

// --- RTK
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { addToCart } from "@features/cart/cartSlice";
import { addToWishlist, removeFromWishlist } from "@features/wishlist/wishlistSlice";

// --- Types
type SpecialOfferCardProps = {
  specialOffer: ProductType;
  isOdd: boolean;
};

// --- Main Component
const SpecialOfferCard = ({ specialOffer, isOdd }: SpecialOfferCardProps) => {
  const { _id, title, images, discount, rating, reviewsCount, price, priceAfterDiscount, category } = specialOffer;
  const hasMultipleImages = images && images.length > 1;

  // --- RTK
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const isSaved = wishlistItems.some((item) => item._id === _id);

  // --- Add to Cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addToCart({
        productId: _id,
        title,
        image: images[0]?.url || "",
        price: priceAfterDiscount,
        count: 1,
        category,
      }),
    );
  };

  // --- Save for Later toggle
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (isSaved) {
      dispatch(removeFromWishlist(_id));
    } else {
      dispatch(addToWishlist(specialOffer));
    }
  };

  // --- Return JSX
  return (
    <div
      className={cn(
        "group relative bg-white shadow-soft rounded-md px-4 sm:px-5 pt-5 pb-4 min-h-75 hover:shadow-standard hover:scale-[1.01] transition-all duration-300 flex flex-col gap-3",
        isOdd && "xl:last:col-span-2",
      )}
    >
      {/* Card Discount */}
      <div className="bg-secondary text-white text-lg sm:text-xl py-1 px-4 sm:w-37.5 text-center rounded-full sm:ml-auto">
        {discount}% OFF
      </div>

      {/* Card Details */}
      <div className="flex max-sm:flex-col items-center justify-center gap-4 w-full max-lg:w-4/5 max-xl:w-3/5 mx-auto flex-1">
        {/* Product Image */}
        <div className="relative w-40 h-40 sm:w-50 sm:h-50 shrink-0 overflow-hidden rounded-md">
          {hasMultipleImages ? (
            <div className="flex w-full h-full transition-transform duration-500 ease-in-out group-hover:-translate-x-full">
              <img
                src={getOptimizedImageUrl(images[0]?.url, 400)}
                alt={`First Image : ${title}`}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400";
                }}
                className="w-full h-full object-contain shrink-0"
              />
              <img
                src={getOptimizedImageUrl(images[1]?.url, 400)}
                alt={`Second Image : ${title}`}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getOptimizedImageUrl(images[0]?.url, 400);
                }}
                className="w-full h-full object-contain shrink-0"
              />
            </div>
          ) : (
            <img
              src={getOptimizedImageUrl(images[0]?.url, 400)}
              alt={`Image : ${title}`}
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400";
              }}
              className="w-full h-full object-contain transition-transform duration-300 ease-in-out group-hover:scale-110"
            />
          )}
        </div>

        {/* Product Description */}
        <div className="flex max-sm:items-center max-sm:text-center flex-col flex-1 min-w-0 xl:pl-5">
          <h3 className="text-primary max-xl:text-xl text-2xl font-medium line-clamp-1">{title}</h3>
          {/* --- Reviews */}
          <RatingAndViews rating={rating} reviews={reviewsCount} />
          {/* --- Price And Discount */}
          <Discount price={price} discount={discount} />
        </div>
      </div>

      {/* --- Bottom Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-100">
        {/* Add to Cart + Save buttons */}
        <div className="flex items-center gap-2">
          {/* Add to Cart */}
          <button
            type="button"
            aria-label={`Add ${title} to cart`}
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 bg-warning text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-amber-300 active:scale-[0.97] transition-all duration-150 cursor-pointer"
          >
            <GrCart className="text-sm" />
            Add to Cart
          </button>

          {/* Save for Later */}
          <div className="relative group/heart">
            <button
              type="button"
              aria-label={isSaved ? `Remove ${title} from saved` : `Save ${title} for later`}
              onClick={handleWishlistToggle}
              disabled={!isAuthenticated}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full shadow-sm transition-all duration-150",
                isAuthenticated
                  ? "bg-white border border-red-200 text-red-500 hover:bg-red-50 active:scale-[0.97] cursor-pointer"
                  : "bg-white border border-gray-200 text-gray-300 cursor-not-allowed",
              )}
            >
              {isSaved ? <FaHeart className="text-sm" /> : <FaRegHeart className="text-sm" />}
            </button>
            {!isAuthenticated && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/heart:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                Login to save
              </span>
            )}
          </div>
        </div>

        {/* See More Button */}
        <Link
          aria-label={`View details for ${title}`}
          className="flex justify-center items-center bg-primary text-white px-4 h-9 rounded-tr-lg rounded-bl-lg cursor-pointer hover:bg-warning transition-colors duration-150 text-sm font-medium"
          to={`/products/specialOffers/${_id}`}
        >
          See More →
        </Link>
      </div>
    </div>
  );
};
export default SpecialOfferCard;

