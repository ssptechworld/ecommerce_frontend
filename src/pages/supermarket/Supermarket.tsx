// --- Libraries
import { useEffect } from "react";

// --- Local Components
import CategoryTemplate from "@components/category-template/CategoryTemplate";

// --- Custom Hooks & Actions
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchProductsByCategory } from "@features/products/productsSlice";

// --- Main Component
const Supermarket = () => {
  // --- Fetching Data from Redux
  const { loading, error, supermarket, fetchedCategories } = useAppSelector((state) => state.products);

  const isSupermarketFetched = fetchedCategories["supermarket"] ?? false;

  // --- Dispatch Action
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!loading && !isSupermarketFetched) {
      dispatch(fetchProductsByCategory("supermarket"));
    }
  }, [dispatch, loading, isSupermarketFetched]);

  // --- Return JSX
  return (
    <div>
      <CategoryTemplate
        imageSrc="/images/posters/supermarket-poster.webp"
        altText="Supermarket Poster"
        title="Supermarket & Daily Essentials"
        currentCategoryKey="supermarket"
        loading={loading}
        error={error}
        items={supermarket}
      />
    </div>
  );
};

export default Supermarket;
