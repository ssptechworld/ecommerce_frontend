// --- Libraries
import { useEffect } from "react";

// --- Local Components
import CategoryTemplate from "@components/category-template/CategoryTemplate";

// --- Custom Hooks & Actions
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchProductsByCategory } from "@features/products/productsSlice";

// --- Main Component
const Women = () => {
  // --- Fetching Data
  const { loading, error, dresses, handbags, fetchedCategories } = useAppSelector((state) => state.products);

  const isDressesFetched = fetchedCategories["dresses"] ?? false;
  const isHandbagsFetched = fetchedCategories["handbags"] ?? false;

  // --- Dispatch Data
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!loading && !isDressesFetched) {
      dispatch(fetchProductsByCategory("dresses"));
    }
    if (!loading && !isHandbagsFetched) {
      dispatch(fetchProductsByCategory("handbags"));
    }
  }, [dispatch, loading, isDressesFetched, isHandbagsFetched]);

  return (
    <div>
      <CategoryTemplate
        imageSrc="/images/posters/women-poster.webp"
        altText="Women Poster"
        title="Women's Collection"
        currentCategoryKey="women"
        loading={loading}
        error={error}
        items={[...dresses, ...handbags]}
      />
    </div>
  );
};
export default Women;
