// --- Libraries
import { useEffect, useState } from "react";
import { useParams } from "react-router";

// --- Local Files
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { clearSingleProduct, fetchSingleProduct } from "@features/products/productsSlice";

// --- Local Components
import Discount from "@components/card/components/discount/Discount";
import RatingAndViews from "@components/card/components/rating-and-reviews/RatingAndReviews";
import ProductImages from "@components/card/components/product-images/ProductImages";
import Spinner from "@components/spinner/Spinner";
import ErrorHandler from "@components/error-handler/ErrorHandler";
import SpecialOffers from "@pages/home/special-offers/SpecialOffers";
import HomeProductsSection from "@components/home-products-section/HomeProductsSection";

// --- Redux Features
import { addToCart } from "@features/cart/cartSlice";
import { addToWishlist, removeFromWishlist } from "@features/wishlist/wishlistSlice";

// --- React Icons
import { FaHeart, FaRegHeart } from "react-icons/fa";

// --- Types
import type { CategoriesType, ProductType } from "@/types/types";

const categoryToPath: Record<string, string> = {
  laptops: "/electronics",
  mobiles: "/electronics",
  appliances: "/kitchen",
  cookware: "/kitchen",
  clothing: "/men",
  shoes: "/men",
  dresses: "/women",
  handbags: "/women",
  supermarket: "/supermarket",
  automotive: "/automotive",
};

// --- Main Component
const ProductDetails = () => {
  const { category, id } = useParams();
  const [count, setCount] = useState<number>(1);
  const currentCategory = category === "special-offers" ? "specialOffers" : category;

  // --- RTK Custom Hooks
  const { loading, singleProduct, error } = useAppSelector((state) => state.products);
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const isSaved = singleProduct ? wishlistItems.some((item) => item._id === singleProduct._id) : false;

  // --- Fetch Data
  useEffect(() => {
    if (id) {
      dispatch(fetchSingleProduct({ id }));
    }
    return () => {
      dispatch(clearSingleProduct());
    };
  }, [dispatch, id]);

  // --- Add To Cart Logic
  const addToCartFunc = (product: ProductType) => {
    const cartItem = {
      productId: product._id,
      title: product.title,
      image: product.images[0]?.url || "",
      price: product.priceAfterDiscount,
      count: count,
      stock: product.stock,
      category: product.category,
    };
    dispatch(addToCart(cartItem));
  };

  // --- Save for Later toggle
  const handleWishlistToggle = (product: ProductType) => {
    if (!isAuthenticated) return;
    if (isSaved) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  // --- Handle Count Change Function
  const handleCountChange = (value: string) => {
    const num = Number(value);
    const maxVal = singleProduct?.stock !== undefined && singleProduct.stock > 0 ? Math.min(25, singleProduct.stock) : 1;
    if (num >= 1 && num <= maxVal) setCount(num);
    else if (value === "") setCount(1);
  };

  // --- Return JSX
  return (
    <div>
      {loading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner />
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center justify-center my-5">
          <ErrorHandler error={error} />
        </div>
      )}

      {!loading && !error && singleProduct && (
        <div className="mb-10">
          <div className="bg-primary/10 my-5 sm:p-5 rounded-lg">
            <div className="bg-white shadow-strong lg:w-3/4 mx-auto grid grid-cols-4 gap-5 p-4 sm:p-5 rounded-md">
              <ProductImages images={singleProduct.images} title={singleProduct.title} />

              {/* Card Details */}
              <div className="col-span-4 md:col-span-2">
                <div>
                  <h1 className="text-primary text-xl sm:text-[22px] font-medium underline decoration-warning mb-2.5 flex flex-wrap items-center gap-2 sm:gap-3">
                    {singleProduct.title}
                    {(singleProduct.stock === undefined || singleProduct.stock <= 0) && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider no-underline">
                        Sold Out
                      </span>
                    )}
                  </h1>
                  <p className="text-primary text-[14px] xl:text-base text-justify">{singleProduct.description}</p>

                  <RatingAndViews rating={singleProduct.rating} reviews={singleProduct.reviewsCount} />

                  <Discount price={singleProduct.price} discount={singleProduct.discount} />

                  {/* Quantity */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-5">
                    <input
                      type="number"
                      onChange={(e) => handleCountChange(e.target.value)}
                      className="border border-primary w-20 rounded-sm p-1 outline-none disabled:opacity-50 disabled:bg-gray-100"
                      value={count}
                      min={1}
                      max={singleProduct.stock !== undefined && singleProduct.stock > 0 ? Math.min(25, singleProduct.stock) : 1}
                      disabled={singleProduct.stock === undefined || singleProduct.stock <= 0}
                    />
                    <button
                      type="button"
                      aria-label="Add to cart"
                      onClick={() => addToCartFunc(singleProduct)}
                      disabled={singleProduct.stock === undefined || singleProduct.stock <= 0}
                      className={`px-4 py-1.5 rounded-sm font-bold transition-all duration-150 ${
                        singleProduct.stock === undefined || singleProduct.stock <= 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-warning text-primary cursor-pointer hover:bg-amber-300 active:scale-[0.98]"
                      }`}
                    >
                      {singleProduct.stock === undefined || singleProduct.stock <= 0 ? "Out of Stock" : "Add to cart"}
                    </button>

                    {/* Save for Later */}
                    <div className="relative group/heart">
                      <button
                        type="button"
                        aria-label={isSaved ? "Remove from saved" : "Save for later"}
                        onClick={() => handleWishlistToggle(singleProduct)}
                        disabled={!isAuthenticated}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-sm font-bold border transition-all duration-150 ${
                          isAuthenticated
                            ? isSaved
                              ? "bg-red-50 border-red-400 text-red-500 hover:bg-red-100 cursor-pointer active:scale-[0.98]"
                              : "bg-white border-red-300 text-red-400 hover:bg-red-50 hover:border-red-500 cursor-pointer active:scale-[0.98]"
                            : "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
                        }`}
                      >
                        {isSaved ? <FaHeart /> : <FaRegHeart />}
                        {isSaved ? "Saved" : "Save"}
                      </button>
                      {!isAuthenticated && (
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-gray-800 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover/heart:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                          Login to save items
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            {currentCategory === "specialOffers" && <SpecialOffers className="mt-0" excludeId={id} />}
            {currentCategory !== "specialOffers" && (
              <HomeProductsSection
                title={"Recommended For You"}
                excludeId={id}
                categoryKey={currentCategory as CategoriesType}
                to={categoryToPath[currentCategory as CategoriesType] || "/"}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
