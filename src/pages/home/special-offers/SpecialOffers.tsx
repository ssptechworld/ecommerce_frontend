// --- Libraries
import { useEffect, useMemo, useRef, useState } from "react";

// --- Utils
import { cn } from "@utils/cn";

// --- Local Files
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchProductsByCategory } from "@features/products/productsSlice";

// --- Local Components
import SpecialOfferCard from "@pages/home/special-offers/components/SpecialOfferCard";
import Spinner from "@components/spinner/Spinner";
import ErrorHandler from "@components/error-handler/ErrorHandler";
import CustomTitle from "@components/custom-title/CustomTitle";

// --- Types
import type { ProductType } from "@/types/types";

type SpecialOffersProps = React.ComponentProps<"div"> & {
  excludeId?: string;
};

// --- Main Component
const SpecialOffers = ({ excludeId, className, ...rest }: SpecialOffersProps) => {
  // --- Fetch SpecialOffers
  const state = useAppSelector((state) => state.products);
  const { specialOffers = [], error } = state;

  const loading = state.categoryLoading["specialOffers"] ?? false;
  const isFetched = state.fetchedCategories["specialOffers"] ?? false;

  // --- Lazy Loading State & Observer
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isFetched]);

  const dispatch = useAppDispatch();
  useEffect(() => {
    if (hasBeenVisible && !loading && !isFetched) {
      dispatch(fetchProductsByCategory("specialOffers"));
    }
  }, [dispatch, loading, isFetched, hasBeenVisible]);

  const displayProducts = useMemo(() => {
    return (specialOffers || []).filter((item: ProductType) => item._id !== excludeId);
  }, [excludeId, specialOffers]);

  // --- Return JSX
  return (
    <div ref={containerRef} className={cn("mt-24 mb-10 min-h-[300px]", className)} {...rest}>
      <CustomTitle title="Massive Deals Today – Only For 24 Hours" offer={true} className="mb-10" />

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

      {!loading && !error && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {displayProducts.map((specialOffer: ProductType) => (
            <SpecialOfferCard
              key={specialOffer._id}
              specialOffer={specialOffer}
              isOdd={displayProducts.length % 2 !== 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SpecialOffers;
