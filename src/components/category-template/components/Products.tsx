// --- Libraries
import { useMemo, useState, useEffect } from "react";

// --- Local Components
import ProductCard from "@components/card/ProductCard";
import Pagination from "@components/pagination/Pagination";
import ErrorHandler from "@components/error-handler/ErrorHandler";
import Spinner from "@components/spinner/Spinner";
import EmptyState from "@components/empty-state/EmptyState";

// --- Custom Hooks & Actions
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchProductsByCategory } from "@features/products/productsSlice";

// --- Types
import type { CurrentProductsType, CurrentPriceType, ProductType, CategoriesType } from "@/types/types";

type ProductsProps = {
  loading: boolean;
  error: string;
  items: ProductType[];
  currentPrice: CurrentPriceType;
  currentProducts: CurrentProductsType;
};

// --- Main Component
const Products = ({
  currentPrice = "no-sorting",
  currentProducts = "all-products",
  loading,
  error,
  items,
}: ProductsProps) => {
  const dispatch = useAppDispatch();
  const itemsPerPage = 6;

  const {
    totalPages: serverTotalPages,
    currentPage: serverCurrentPage,
    fetchedCategories,
  } = useAppSelector((state) => state.products);

  const [localPage, setLocalPage] = useState<number>(0);

  // Trigger backend query whenever category or sort selection changes
  useEffect(() => {
    if (currentProducts !== "all-products") {
      dispatch(
        fetchProductsByCategory({
          category: currentProducts as CategoriesType,
          sort: currentPrice,
          page: 1,
          limit: 100,
        })
      );
    }
  }, [currentProducts, currentPrice, dispatch]);

  const filteredProducts = useMemo(() => {
    let result = [...items];
    if (currentProducts !== "all-products") {
      result = result.filter((product) => product.category === currentProducts);
    }
    
    if (currentPrice === "low-to-high") {
      result.sort((a, b) => a.priceAfterDiscount - b.priceAfterDiscount);
    } else if (currentPrice === "high-to-low") {
      result.sort((a, b) => b.priceAfterDiscount - a.priceAfterDiscount);
    }
    
    return result;
  }, [items, currentProducts, currentPrice]);

  const isCategoryFetched = currentProducts !== "all-products" ? (fetchedCategories[currentProducts] ?? false) : false;
  const isServerPaged = currentProducts !== "all-products" && !isCategoryFetched;

  const page = isServerPaged ? serverCurrentPage - 1 : localPage;
  const pages = isServerPaged ? serverTotalPages : Math.ceil(filteredProducts.length / itemsPerPage) || 0;

  const paginatedItems = useMemo(() => {
    if (isServerPaged) {
      return filteredProducts.slice(0, itemsPerPage);
    }

    const start = localPage * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, localPage, isServerPaged]);

  useEffect(() => {
    if (isServerPaged) {
      dispatch(
        fetchProductsByCategory({
          category: currentProducts as CategoriesType,
          page: 1,
          limit: itemsPerPage,
        }),
      );
    }
  }, [currentProducts, isServerPaged, dispatch]);

  // دالة الانتقال بين الصفحات
  const handlePageChange = (newPage: number) => {
    if (isServerPaged) {
      dispatch(
        fetchProductsByCategory({
          category: currentProducts as CategoriesType,
          page: newPage + 1,
          limit: itemsPerPage,
        }),
      );
    } else {
      setLocalPage(newPage);
    }
  };

  // --- Return JSX
  return (
    <>
      {loading && (
        <div className="flex items-center justify-center min-h-80 col-span-5 sm:col-span-3 lg:col-span-4">
          <Spinner />
        </div>
      )}
      {!loading && error && (
        <div className="flex items-center justify-center col-span-5 sm:col-span-3 lg:col-span-4">
          <ErrorHandler error={error} />
        </div>
      )}
      {!loading && !error && (
        <section className="relative col-span-5 sm:col-span-3 lg:col-span-4">
          {paginatedItems.length === 0 ? (
            <EmptyState
              title="No products found"
              desc="No products match the selected filter right now. Try choosing another category or check back soon."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 px-1 sm:px-2.5 justify-items-center">
                {paginatedItems.map((product: ProductType) => (
                  <ProductCard key={product._id} product={{ ...product }} />
                ))}
              </div>
              {pages > 1 && (
                <Pagination
                  pages={pages}
                  page={page}
                  setPage={(newPage) => {
                    const targetPage = typeof newPage === "function" ? newPage(page) : newPage;
                    handlePageChange(targetPage);
                  }}
                  className="mt-8 flex justify-center"
                />
              )}
            </>
          )}
        </section>
      )}
    </>
  );
};

export default Products;
