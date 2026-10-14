// --- Libraries
import { useEffect, useMemo, useRef, useState } from "react";

// --- Utils
import { cn } from "@utils/cn";

// --- Local Files
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchProductsByCategory } from "@features/products/productsSlice";

// --- Local Components
import ProductCard from "@components/card/ProductCard";
import ProductSlider from "@components/product-slider/ProductSlider";
import Spinner from "@components/spinner/Spinner";
import ErrorHandler from "@components/error-handler/ErrorHandler";
import CustomTitle from "@components/custom-title/CustomTitle";

// --- Types
import type { CategoriesType, ProductType } from "@/types/types";

// --- Types
type HomeProductsSectionProps = React.ComponentProps<"section"> & {
  excludeId?: string;
  categoryKey: CategoriesType;
  to: string;
  title: string;
};

// --- Main Component
const HomeProductsSection = ({ excludeId, categoryKey, to, title, className, ...rest }: HomeProductsSectionProps) => {
  // --- Fetch Data
  const state = useAppSelector((state) => state.products);
  const products = (state[categoryKey] || []) as ProductType[];
  const error = state.error;

  const loading = state.categoryLoading[categoryKey] ?? false;
  const isFetched = state.fetchedCategories[categoryKey] ?? false;

  // --- Lazy Loading State & Observer
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFetched) {
      setHasBeenVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isFetched]);

  // --- Dispatch
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (hasBeenVisible && !loading && !isFetched) {
      dispatch(fetchProductsByCategory(categoryKey));
    }
  }, [categoryKey, dispatch, loading, isFetched, hasBeenVisible]);

  // --- Filtering Data
  const displayProducts = useMemo(() => {
    return (products || []).filter((item: ProductType) => item._id !== excludeId);
  }, [excludeId, products]);

  // --- Return JSX
  return (
    <section ref={sectionRef} {...rest} className={cn("min-h-[250px]", className)}>
      <CustomTitle to={to} title={title} className="my-5" />

      {loading && (
        <div className="flex items-center justify-center my-5">
          <Spinner />
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center justify-center my-5">
          <ErrorHandler error={error} />
        </div>
      )}

      {!loading && !error && displayProducts.length > 0 && (
        <ProductSlider productsCount={displayProducts.length}>
          {displayProducts.map((item: ProductType) => (
            <ProductCard className="first-of-type:ml-3.75 last-of-type:mr-3.75" key={item._id} product={{ ...item }} />
          ))}
        </ProductSlider>
      )}
    </section>
  );
};

export default HomeProductsSection;
