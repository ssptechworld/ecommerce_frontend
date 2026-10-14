// --- Libraries
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { FiUploadCloud, FiTrash2, FiX, FiCheck, FiFileText } from "react-icons/fi";

// --- Components
import InputField from "@components/inputs/InputField";
import CustomButton from "@components/custom-button/CustomButton";
import ErrorHandler from "@components/error-handler/ErrorHandler";

// --- Redux
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { addProduct, fetchSingleProduct, updateProduct } from "@features/products/productsSlice";

// --- Data
import { ALL_CATEGORIES } from "@data/productCategories";

// --- Types
import type { CategoriesType, ProductImageType } from "@/types/types";

// --- Product Schema
const ProductSchema = z.object({
  // Basic Info
  title: z.string().trim().min(1, "Title is required"),
  category: z.enum(ALL_CATEGORIES),
  subCategory: z.string().optional(),
  productType: z.string().optional(),
  brand: z.string().optional(),
  description: z.string().trim().min(10, "Description should be longer"),

  // Logistics & Pricing
  price: z.string().min(1, "Price is required"),
  discount: z.string().min(1, "Discount is required"),
  stock: z.string().min(1, "Stock is required"),
  minimumOrderQuantity: z.string().optional(),
  productWeight: z.string().optional(),
  productDimensions: z.string().optional(),
  totalPackedWeight: z.string().optional(),
  totalPackageDimensions: z.string().optional(),
  deliveryTime: z.string().optional(),
  specialCareDescription: z.string().optional(),

  // Return Policy
  returnEligible: z.boolean().default(false),
  returnWindow: z.string().optional(),
  returnType: z.string().optional(),
  returnShippingCost: z.string().optional(),
  returnInstructions: z.string().optional(),

  // Warranty Policy
  warrantyAvailable: z.boolean().default(false),
  warrantyPeriod: z.string().optional(),
  warrantyProvide: z.string().optional(),
  warrantyTerms: z.string().optional(),
});
type ProductSchemaType = z.infer<typeof ProductSchema>;

// --- Main Component
const AddProduct = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { category, id } = useParams();

  const [keptImages, setKeptImages] = useState<ProductImageType[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [specFile, setSpecFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(ProductSchema) as any,
    defaultValues: {
      returnEligible: false,
      warrantyAvailable: false,
    }
  });

  const isReturnEligible = watch("returnEligible");
  const isWarrantyAvailable = watch("warrantyAvailable");

  // --- Get Product Data reliably
  const productFromAdmin = useAppSelector((state) =>
    state.products.adminProducts.find((p) => p._id === id),
  );
  const productFromSingle = useAppSelector((state) => state.products.singleProduct);
  const productFromCat = useAppSelector((state) =>
    category && state.products[category as CategoriesType]
      ? state.products[category as CategoriesType].find((p) => p._id === id)
      : undefined,
  );
  const product: any = productFromAdmin ?? productFromCat ?? (productFromSingle?._id === id ? productFromSingle : undefined) ?? undefined;

  useEffect(() => {
    if (id && !product) {
      dispatch(fetchSingleProduct({ id }));
    }
  }, [dispatch, id, product]);

  // --- Fill Form & Images State With Product Data
  useEffect(() => {
    if (product) {
      reset({
        title: product.title || "",
        category: product.category,
        subCategory: product.subCategory || "",
        productType: product.productType || "",
        brand: product.brand || "",
        description: product.description || "",
        price: String(product.price || 0),
        discount: String(product.discount || 0),
        stock: String(product.stock || 10),
        minimumOrderQuantity: String(product.minimumOrderQuantity || 1),
        productWeight: product.productWeight || "",
        productDimensions: product.productDimensions || "",
        totalPackedWeight: product.totalPackedWeight || "",
        totalPackageDimensions: product.totalPackageDimensions || "",
        deliveryTime: product.deliveryTime || "",
        specialCareDescription: product.specialCareDescription || "",
        returnEligible: product.returnEligible || false,
        returnWindow: String(product.returnWindow || 0),
        returnType: product.returnType || "",
        returnShippingCost: product.returnShippingCost || "",
        returnInstructions: product.returnInstructions || "",
        warrantyAvailable: product.warrantyAvailable || false,
        warrantyPeriod: product.warrantyPeriod || "",
        warrantyProvide: product.warrantyProvide || "",
        warrantyTerms: product.warrantyTerms || "",
      });
      setKeptImages(product.images || []);
    }
  }, [reset, product]);

  // Clean up object URLs on unmount or file change
  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPreviews]);

  // --- Handle New Files Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const selectedFiles = Array.from(e.target.files);
    const validImageFiles = selectedFiles.filter((file) => file.type.startsWith("image/"));

    if (validImageFiles.length === 0) {
      toast.error("Please select valid image files");
      return;
    }

    const updatedFiles = [...newFiles, ...validImageFiles];
    setNewFiles(updatedFiles);

    const generatedPreviews = validImageFiles.map((file) => URL.createObjectURL(file));
    setNewPreviews((prev) => [...prev, ...generatedPreviews]);
  };

  const handleSpecSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setSpecFile(e.target.files[0]);
  };

  // --- Remove Kept Image (Existing)
  const handleRemoveKeptImage = (indexToRemove: number) => {
    setKeptImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // --- Remove New File (Selected before upload)
  const handleRemoveNewFile = (indexToRemove: number) => {
    URL.revokeObjectURL(newPreviews[indexToRemove]);
    setNewFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setNewPreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // --- OnSubmit Function
  const onSubmit = async (data: ProductSchemaType) => {
    const totalImageCount = keptImages.length + newFiles.length;

    if (totalImageCount === 0) {
      toast.error("Please upload at least one image for the product");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Append all string fields
      Object.keys(data).forEach((key) => {
        const value = (data as any)[key];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      });
      
      formData.append("keptImages", JSON.stringify(keptImages));

      newFiles.forEach((file) => {
        formData.append("images", file);
      });

      if (specFile) {
        formData.append("specificationSheet", specFile);
      }

      if (product) {
        await dispatch(updateProduct({ id: product._id, formData })).unwrap();
        toast.success("Product updated successfully!");
      } else {
        await dispatch(addProduct(formData)).unwrap();
        toast.success("Product created successfully!");
      }

      navigate("/admin/products");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Return JSX
  return (
    <div className="flex flex-col h-full gap-5">
      <div className="bg-white p-5 rounded-md shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary font-jetbrains">
          {product ? `Edit Product: "${product.title}"` : "Add New Product"}
        </h1>
        <CustomButton type="button" className="text-sm px-4 py-2" onClick={() => navigate("/admin/products")}>
          Back to List
        </CustomButton>
      </div>

      <div className="bg-white rounded-md shadow-sm p-6 flex-1">
        {id && !product ? (
          <div className="h-64 flex items-center justify-center">
            <ErrorHandler error={"Product Not Found"} />
          </div>
        ) : (
          <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
            
            {/* --- SECTION 1: BASIC INFO --- */}
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50/30">
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">1. Basic Information</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <InputField type="text" name="title" placeholder="e.g. iPhone 15 Pro Max" register={register} label="Product Title" error={errors.title?.message} />
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Category</label>
                  <select {...register("category")} className="border border-gray-300 h-11 px-3 rounded-md focus:border-primary outline-none shadow-sm text-sm">
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <InputField type="text" name="subCategory" placeholder="e.g. Mobile Phones" register={register} label="Sub-Category" error={errors.subCategory?.message} />
                <InputField type="text" name="productType" placeholder="e.g. Smartphone" register={register} label="Product Type" error={errors.productType?.message} />
                <InputField type="text" name="brand" placeholder="e.g. Samsung" register={register} label="Brand" error={errors.brand?.message} />

                <div className="lg:col-span-3 relative flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Description</label>
                  <textarea {...register("description")} placeholder="Enter detailed product description..." className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-primary h-28 text-sm" />
                  {errors.description?.message && <span className="text-xs text-red-500">{errors.description.message}</span>}
                </div>
              </div>
            </div>

            {/* --- SECTION 2: LOGISTICS & PRICING --- */}
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50/30">
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">2. Logistics & Pricing</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <InputField type="number" name="price" placeholder="Price ($)" register={register} label="Price" error={errors.price?.message} />
                <InputField type="number" name="discount" placeholder="Discount (%)" register={register} label="Discount (%)" error={errors.discount?.message} />
                <InputField type="number" name="stock" placeholder="e.g. 100" register={register} label="Available Quantity (Stock)" error={errors.stock?.message} />
                <InputField type="number" name="minimumOrderQuantity" placeholder="e.g. 10" register={register} label="Min Order Quantity" error={errors.minimumOrderQuantity?.message} />
                
                <InputField type="text" name="productWeight" placeholder="e.g. 950g" register={register} label="Product Weight" error={errors.productWeight?.message} />
                <InputField type="text" name="productDimensions" placeholder="e.g. 20 x 10 x 5 cm" register={register} label="Product Dimensions" error={errors.productDimensions?.message} />
                <InputField type="text" name="totalPackedWeight" placeholder="e.g. 1.2kg" register={register} label="Total Packed Weight" error={errors.totalPackedWeight?.message} />
                
                <InputField type="text" name="totalPackageDimensions" placeholder="e.g. 25 x 15 x 8 cm" register={register} label="Total Package Dimensions" error={errors.totalPackageDimensions?.message} />
                <InputField type="text" name="deliveryTime" placeholder="e.g. 5 days" register={register} label="Delivery Time" error={errors.deliveryTime?.message} />
                
                <div className="lg:col-span-3 relative flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Special Care Description</label>
                  <textarea {...register("specialCareDescription")} placeholder="e.g. Glass item, handle with care" className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-primary h-16 text-sm" />
                </div>
              </div>
            </div>

            {/* --- SECTION 3: POLICIES --- */}
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50/30">
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">3. Policies (Returns & Warranty)</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Return Policy */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="returnEligible" {...register("returnEligible")} className="w-4 h-4 text-primary" />
                    <label htmlFor="returnEligible" className="text-sm font-bold text-gray-800">Return Eligible</label>
                  </div>
                  {isReturnEligible && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7 border-l-2 border-primary/20">
                      <InputField type="number" name="returnWindow" placeholder="e.g. 30 (Days)" register={register} label="Return Window (Days)" />
                      <InputField type="text" name="returnType" placeholder="Refund / Replacement" register={register} label="Return Type" />
                      <InputField type="text" name="returnShippingCost" placeholder="Seller / Platform" register={register} label="Return Shipping Cost" />
                      <div className="md:col-span-2 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700">Return Instructions</label>
                        <textarea {...register("returnInstructions")} placeholder="Special instructions for returns..." className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-primary h-16 text-sm" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Warranty Policy */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="warrantyAvailable" {...register("warrantyAvailable")} className="w-4 h-4 text-primary" />
                    <label htmlFor="warrantyAvailable" className="text-sm font-bold text-gray-800">Warranty Available</label>
                  </div>
                  {isWarrantyAvailable && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7 border-l-2 border-primary/20">
                      <InputField type="text" name="warrantyPeriod" placeholder="e.g. 12 Months" register={register} label="Warranty Period" />
                      <InputField type="text" name="warrantyProvide" placeholder="Brand / Seller" register={register} label="Warranty Provider" />
                      <div className="md:col-span-2 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700">Warranty Terms</label>
                        <textarea {...register("warrantyTerms")} placeholder="Detailed warranty terms..." className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-primary h-16 text-sm" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- SECTION 4: MEDIA & DOCUMENTS --- */}
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50/30">
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">4. Media & Documents</h2>
              
              <div className="flex flex-col gap-8">
                {/* Images */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                        <FiUploadCloud className="text-primary" size={18} /> Product Images
                      </h3>
                      <p className="text-xs text-gray-500">Upload multiple images for this product.</p>
                    </div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 rounded-md text-xs font-semibold cursor-pointer">
                      <FiUploadCloud size={16} /> Select Images
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {keptImages.map((img, idx) => (
                      <div key={`kept-${idx}`} className="relative group border border-gray-200 rounded-md p-1 bg-white shadow-sm flex flex-col items-center justify-center h-28">
                        <img src={img.url} alt={`img-${idx}`} className="max-w-full max-h-full object-contain" />
                        <span className="absolute bottom-1 left-1 bg-gray-800/70 text-white text-[9px] px-1 rounded">Existing</span>
                        <button type="button" className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-opacity shadow cursor-pointer" onClick={() => handleRemoveKeptImage(idx)}>
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {newPreviews.map((previewUrl, idx) => (
                      <div key={`new-${idx}`} className="relative group border border-emerald-300 rounded-md p-1 bg-emerald-50/50 shadow-sm flex flex-col items-center justify-center h-28">
                        <img src={previewUrl} alt={`new-${idx}`} className="max-w-full max-h-full object-contain" />
                        <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[9px] px-1 rounded font-bold">New</span>
                        <button type="button" className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-opacity shadow cursor-pointer" onClick={() => handleRemoveNewFile(idx)}>
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                    {keptImages.length === 0 && newPreviews.length === 0 && (
                      <div className="col-span-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
                        <FiUploadCloud size={32} className="text-gray-300" />
                        <span>No images added yet. Click "Select Images".</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specification Sheet */}
                <div className="flex flex-col gap-4 border-t pt-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                        <FiFileText className="text-primary" size={18} /> Specification Sheet (CSV/PDF)
                      </h3>
                      <p className="text-xs text-gray-500">Upload a technical specification document.</p>
                    </div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 rounded-md text-xs font-semibold cursor-pointer">
                      <FiUploadCloud size={16} /> {specFile ? "Change File" : "Select File"}
                      <input type="file" accept=".csv, .pdf, .txt" className="hidden" onChange={handleSpecSelect} />
                    </label>
                  </div>
                  {specFile && (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                      <span className="text-xs font-semibold text-emerald-800 break-all">{specFile.name}</span>
                      <button type="button" className="text-red-500 hover:bg-red-50 p-1 rounded" onClick={() => setSpecFile(null)}>
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  )}
                  {!specFile && product?.productSpecificationSheetUrl && (
                     <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <a href={product.productSpecificationSheetUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 underline break-all">
                        View Existing Specification Sheet
                      </a>
                   </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 mt-4">
              <CustomButton type="button" className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-6 py-3 rounded-md text-sm font-semibold" onClick={() => navigate("/admin/products")}>
                Cancel
              </CustomButton>
              <CustomButton type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-md text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiCheck size={18} />
                    {product ? "Update Product" : "Create Product"}
                  </>
                )}
              </CustomButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddProduct;
