// --- Libraries
import { useEffect } from "react";

// --- Local Components
import CategoryTemplate from "@components/category-template/CategoryTemplate";

// --- Custom Hooks & Actions
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchProductsByCategory } from "@features/products/productsSlice";

// --- Main Component
const Men = () => {
  // --- Fetching Data
  const { loading, error, clothing, shoes, fetchedCategories } = useAppSelector((state) => state.products);

  const isClothingFetched = fetchedCategories["clothing"] ?? false;
  const isShoesFetched = fetchedCategories["shoes"] ?? false;

  // --- Dispatch Data
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!loading && !isClothingFetched) {
      dispatch(fetchProductsByCategory("clothing"));
    }
    if (!loading && !isShoesFetched) {
      dispatch(fetchProductsByCategory("shoes"));
    }
  }, [dispatch, loading, isClothingFetched, isShoesFetched]);

  return (
    <div>
      <CategoryTemplate
        imageSrc="/images/posters/men-poster.webp"
        altText="Men Poster"
        title="Men's Fashion"
        currentCategoryKey="men"
        loading={loading}
        error={error}
        items={[...clothing, ...shoes]}
      />
    </div>
  );
};
export default Men;
