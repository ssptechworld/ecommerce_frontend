// --- Libraries
import { useEffect } from "react";

// --- Local Components
import CategoryTemplate from "@components/category-template/CategoryTemplate";

// --- Custom Hooks & Actions
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchProductsByCategory } from "@features/products/productsSlice";

// --- Main Component
const Kitchen = () => {
  // --- Fetching Data
  const { loading, error, appliances, cookware, fetchedCategories } = useAppSelector((state) => state.products);

  const isAppliancesFetched = fetchedCategories["appliances"] ?? false;
  const isCookwareFetched = fetchedCategories["cookware"] ?? false;

  // --- Dispatch Data
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!loading && !isAppliancesFetched) {
      dispatch(fetchProductsByCategory("appliances"));
    }
    if (!loading && !isCookwareFetched) {
      dispatch(fetchProductsByCategory("cookware"));
    }
  }, [dispatch, loading, isAppliancesFetched, isCookwareFetched]);

  return (
    <div>
      <CategoryTemplate
        imageSrc="/images/posters/kitchen-poster.webp"
        altText="Kitchen Poster"
        title="Kitchen & Dining"
        currentCategoryKey="kitchen"
        loading={loading}
        error={error}
        items={[...appliances, ...cookware]}
      />
    </div>
  );
};
export default Kitchen;
