// --- Libraries
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { FiX, FiLoader, FiSearch } from "react-icons/fi";

// --- Utils & Types
import api from "@utils/api";
import { formatCurrency } from "@utils/formatCurrency";
import type { ProductType } from "@/types/types";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // --- Debounced Search Fetching
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      try {
        const response = await api.get(`/products?keyword=${encodeURIComponent(trimmed)}&limit=8`);
        setResults(response.data.products || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // --- Close Dropdown on Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handle Product Selection
  const handleSelectProduct = (product: ProductType) => {
    setIsOpen(false);
    setQuery("");
    navigate(`/products/${product.category}/${product._id}`);
  };

  // --- Handle Submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (results.length > 0) {
      handleSelectProduct(results[0]);
    }
  };

  // --- Clear Query
  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  // --- Return JSX
  return (
    <div ref={containerRef} className="relative flex-1 w-full my-5 max-sm:my-2.5">
      <form
        onSubmit={handleSubmit}
        className="w-full h-10 lg:h-12.5 flex items-center bg-green-50 rounded-md overflow-hidden border border-transparent focus-within:border-warning transition-colors"
      >
        <button
          aria-label="Submit search"
          className="bg-warning text-primary h-full cursor-pointer px-3 sm:px-5 font-medium text-lg select-none hover:bg-amber-500 active:bg-amber-400 duration-300 transition-colors flex items-center justify-center gap-1.5 shrink-0"
          type="submit"
        >
          <FiSearch className="text-xl" />
          <span className="hidden sm:inline">Search</span>
        </button>
        <div className="relative flex-1 min-w-0 h-full flex items-center">
          <input
            className="w-full h-full px-3 caret-warning outline-0 select-none bg-white overflow-hidden whitespace-nowrap text-ellipsis text-primary text-base font-sans placeholder:text-gray-400 pr-9"
            type="search"
            aria-label="Search products"
            placeholder="What are you looking for?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim() && results.length > 0) setIsOpen(true);
            }}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search text"
              className="absolute right-2.5 text-gray-400 hover:text-gray-700 p-1 cursor-pointer transition-colors"
            >
              <FiX className="text-lg" />
            </button>
          )}
        </div>
      </form>

      {/* --- Live Search Dropdown --- */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden z-999 animate-fadeIn">
          {isLoading ? (
            <div className="flex items-center justify-center p-6 text-gray-500 gap-2">
              <FiLoader className="animate-spin text-warning text-xl" />
              <span className="font-medium text-sm">Searching for "{query}"...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
              <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                <span>Products matching "{query}"</span>
                <span className="text-warning font-bold">{results.length} results</span>
              </div>
              {results.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleSelectProduct(product)}
                  className="flex items-center gap-3.5 p-3 hover:bg-amber-50/60 cursor-pointer transition-colors group"
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                    <img
                      src={product.images?.[0]?.url || "/logo.svg"}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-800 truncate group-hover:text-primary transition-colors">
                      {product.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 rounded-full capitalize">
                        {product.category}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {product.discount}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary font-jetbrains">
                      {formatCurrency(product.priceAfterDiscount ?? product.price)}
                    </p>
                    {product.discount > 0 && (
                      <p className="text-xs text-gray-400 line-through font-jetbrains">
                        {formatCurrency(product.price)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm font-medium">No products found matching "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Try checking for typos or search for another item like "laptop", "jeans", or "shoes".</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

