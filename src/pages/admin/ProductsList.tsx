// --- Libraries
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";

// --- React Icons
import { FiSearch, FiEdit, FiTrash2, FiPlus, FiToggleLeft, FiToggleRight, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

// --- Utils
import { formatCurrency } from "@utils/formatCurrency";
import { cn } from "@utils/cn";

// --- Custom Hooks & Actions
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { deleteProduct, fetchAdminProducts, toggleProductStatus } from "@features/products/productsSlice";

// --- Local Components
import CustomButton from "@components/custom-button/CustomButton";
import Modal from "@components/modal/Modal";

// --- Data
import { ALL_CATEGORIES } from "@data/productCategories";

// --- Types
import type { ProductType } from "@/types/types";

// --- Main Component
const ProductsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { adminProducts, adminTotalPages, adminTotalCount, adminLoading } = useAppSelector((state) => state.products);

  // --- Fetch Admin Products when filter/search/page changes
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchAdminProducts({
          category: selectedCategory,
          search: searchTerm,
          page: currentPage,
          limit,
        }),
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, selectedCategory, searchTerm, currentPage]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setCurrentPage(1);
  };

  // --- Toggle Product Status
  const handleToggleStatus = async (product: ProductType) => {
    const targetStatus = !(product.enabled ?? true);
    setTogglingIds((prev) => ({ ...prev, [product._id]: true }));

    try {
      const result = await dispatch(
        toggleProductStatus({
          id: product._id,
          enabled: targetStatus,
        }),
      ).unwrap();

      toast.success(`Product "${result.title}" ${targetStatus ? "enabled" : "disabled"}`);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to toggle status");
    } finally {
      setTogglingIds((prev) => ({ ...prev, [product._id]: false }));
    }
  };

  // --- Handle Modal
  const [isOpen, setIsOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductType | null>(null);

  const onConfirm = () => {
    if (productToDelete) {
      dispatch(
        deleteProduct({
          id: productToDelete._id,
          category: productToDelete.category,
        }),
      )
        .unwrap()
        .then(() => {
          toast.success("Product deleted successfully");
        })
        .catch((err) => {
          toast.error(typeof err === "string" ? err : "Failed to delete product");
        });
      setProductToDelete(null);
    }
  };

  // --- Return JSX
  return (
    <div className="flex flex-col h-full gap-5">
      {/* --- Header & Search / Filters --- */}
      <div className="bg-white p-5 rounded-md shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-primary font-jetbrains">Inventory Management</h1>
          <p className="text-sm text-gray-500">
            Total Products: <span className="font-semibold text-neutral-700">({adminTotalCount})</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name..."
              className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary text-sm transition-all"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => handleSearchChange("")}
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            className="border border-gray-300 py-2 px-3 rounded-md text-sm outline-none focus:border-primary bg-white text-gray-700"
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="all">All Categories</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {(searchTerm || selectedCategory !== "all") && (
            <button
              type="button"
              className="text-xs text-red-500 hover:underline whitespace-nowrap self-center"
              onClick={handleClearFilters}
            >
              Clear filters
            </button>
          )}

          {/* Add Product Button */}
          <CustomButton
            type="button"
            className="text-primary px-4 py-2 rounded-md font-semibold flex items-center justify-center gap-2"
            onClick={() => navigate("/admin/add-product")}
          >
            <FiPlus /> Add Product
          </CustomButton>
        </div>
      </div>

      {/* --- Table --- */}
      <div className="flex-1 bg-white rounded-md shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full min-w-max relative border-separate border-spacing-0">
            <thead>
              <tr className="sticky top-0 z-10 bg-[#EFF2F3] shadow-sm text-neutral-700 *:whitespace-nowrap *:text-center *:text-[11px] *:font-bold *:px-3 *:py-3 *:not-last:border-r *:border-r-gray-200">
                <th>IMAGES</th>
                <th>PRODUCT NAME</th>
                <th>CATEGORY</th>
                <th>PRICE</th>
                <th>RATING</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {adminLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 font-jetbrains">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : adminProducts.length > 0 ? (
                adminProducts.map((product) => {
                  const isEnabled = product.enabled ?? true;
                  const isToggling = togglingIds[product._id];

                  return (
                    <tr
                      key={product._id}
                      className="even:bg-[#EFF2F3]/50 hover:bg-gray-100/70 transition-colors *:whitespace-nowrap *:px-3 *:py-2.5 *:text-center *:text-[12px]"
                    >
                      {/* Image */}
                      <td>
                        <div className="relative inline-block">
                          <div className="bg-white p-1 rounded border border-gray-200 w-12 h-12 mx-auto flex items-center justify-center">
                            <img
                              src={product.images[0]?.url || "/placeholder.png"}
                              alt={product.title}
                              loading="lazy"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          {product.images.length > 1 && (
                            <span
                              className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow"
                              title={`${product.images.length} images total`}
                            >
                              +{product.images.length - 1}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="max-w-xs truncate">
                        <p className="font-semibold text-primary text-[13px] line-clamp-1" title={product.title}>
                          {product.title}
                        </p>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] border border-gray-200 uppercase font-semibold">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="font-bold text-primary">{formatCurrency(product.price)}</td>

                      {/* Rating */}
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-amber-500">★</span>
                          <span>{product.rating}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1",
                            isEnabled
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                              : "bg-rose-100 text-rose-700 border border-rose-300",
                          )}
                        >
                          <span
                            className={cn("w-1.5 h-1.5 rounded-full", isEnabled ? "bg-emerald-500" : "bg-rose-500")}
                          />
                          {isEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="flex items-center justify-center gap-3">
                          {/* Toggle Status Button */}
                          <button
                            type="button"
                            disabled={isToggling}
                            className={cn(
                              "transition-all p-1 rounded cursor-pointer disabled:opacity-50",
                              isEnabled
                                ? "text-emerald-600 hover:bg-emerald-50"
                                : "text-gray-400 hover:bg-gray-100",
                            )}
                            title={isEnabled ? "Disable Product" : "Enable Product"}
                            onClick={() => handleToggleStatus(product)}
                          >
                            {isToggling ? (
                              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                            ) : isEnabled ? (
                              <FiToggleRight size={22} className="text-emerald-600" />
                            ) : (
                              <FiToggleLeft size={22} className="text-gray-400" />
                            )}
                          </button>

                          {/* Edit Link */}
                          <Link
                            to={`/admin/products/edit/${product.category}/${product._id}`}
                            className="text-blue-500 hover:text-blue-700 transition-colors p-1 hover:bg-blue-50 rounded"
                            title="Edit Product"
                          >
                            <FiEdit size={18} />
                          </Link>

                          {/* Delete Button */}
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded cursor-pointer"
                            title="Delete Product"
                            onClick={() => {
                              setIsOpen(true);
                              setProductToDelete(product);
                            }}
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 tracking-wide font-jetbrains text-base">
                    <p className="mb-2 font-semibold">No products found matching your criteria</p>
                    {(searchTerm || selectedCategory !== "all") && (
                      <button
                        type="button"
                        className="text-sm text-primary underline hover:text-primary/80 font-normal"
                        onClick={handleClearFilters}
                      >
                        Reset Search & Filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination Footer --- */}
        {adminTotalPages > 1 && (
          <div className="p-4 bg-[#EFF2F3]/40 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-600 font-jetbrains">
              Page <span className="font-bold text-neutral-800">{currentPage}</span> of{" "}
              <span className="font-bold text-neutral-800">{adminTotalPages}</span> ({adminTotalCount} total items)
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1 || adminLoading}
                className="p-1.5 rounded border border-gray-300 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                <FiChevronLeft size={16} />
              </button>

              {Array.from({ length: adminTotalPages }, (_, i) => i + 1)
                .slice(Math.max(0, currentPage - 3), Math.min(adminTotalPages, currentPage + 2))
                .map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={cn(
                      "px-3 py-1 text-xs font-semibold rounded border transition-colors cursor-pointer",
                      pageNum === currentPage
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
                    )}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

              <button
                type="button"
                disabled={currentPage >= adminTotalPages || adminLoading}
                className="p-1.5 rounded border border-gray-300 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                onClick={() => setCurrentPage((prev) => Math.min(adminTotalPages, prev + 1))}
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isOpen && <Modal setIsOpen={setIsOpen} onConfirm={onConfirm} />}
    </div>
  );
};

export default ProductsList;
