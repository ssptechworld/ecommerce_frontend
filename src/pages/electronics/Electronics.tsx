// --- Libraries
import { useEffect } from "react";

// --- Local Components
import CategoryTemplate from "@components/category-template/CategoryTemplate";

// --- Custom Hooks & Actions
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchProductsByCategory } from "@features/products/productsSlice";

// --- Main Component
const Electronics = () => {
  // --- Fetching Data
  const { loading, error, laptops, mobiles, fetchedCategories } = useAppSelector((state) => state.products);

  const isLaptopsFetched = fetchedCategories["laptops"] ?? false;
  const isMobilesFetched = fetchedCategories["mobiles"] ?? false;

  // --- Dispatch Data
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!loading && !isLaptopsFetched) {
      dispatch(fetchProductsByCategory("laptops"));
    }
    if (!loading && !isMobilesFetched) {
      dispatch(fetchProductsByCategory("mobiles"));
    }
  }, [dispatch, loading, isLaptopsFetched, isMobilesFetched]);

  return (
    <div>
      <CategoryTemplate
        imageSrc={"/images/posters/electronics-poster.webp"}
        altText={"Electronics Poster"}
        title="Electronics"
        currentCategoryKey="electronics"
        loading={loading}
        error={error}
        items={[...laptops, ...mobiles]}
      />
    </div>
  );
};
export default Electronics;
