// --- Libraries
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

// --- RTK
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchUsers } from "@features/users/usersSlice";

// --- Utils
import api from "@utils/api";

// --- Components
import CustomButton from "@components/custom-button/CustomButton";
import InputField from "@components/inputs/InputField";

// --- Define SellerInventory Type
interface SellerInventoryItem {
  _id: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  availableQuantity: number;
}

// --- Zod Schema
const importSchema = z.object({
  sellerId: z.string().min(1, "Please select a seller"),
  inventoryItemId: z.string().min(1, "Please select a product"),
  importQuantity: z.string().min(1, "Import Quantity is required"),
  sellingPrice: z.string().min(1, "Selling Price is required"),
  discount: z.string().optional(),
  customTitle: z.string().optional(),
  customDescription: z.string().optional(),
});

type ImportFormValues = z.infer<typeof importSchema>;

// --- Main Component
const ImportProduct = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { users, loading: usersLoading } = useAppSelector((state) => state.users);

  const [sellers, setSellers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<SellerInventoryItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SellerInventoryItem | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ImportFormValues>({
    resolver: zodResolver(importSchema),
  });

  const selectedSellerId = watch("sellerId");
  const selectedInventoryId = watch("inventoryItemId");

  // Fetch users on mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Filter sellers from users
  useEffect(() => {
    if (users) {
      const sellerUsers = users.filter((user) => (user.role as string) === "seller" || user.role === "admin");
      setSellers(sellerUsers);
    }
  }, [users]);

  // Fetch inventory when seller changes
  useEffect(() => {
    if (selectedSellerId) {
      setInventoryLoading(true);
      api
        .get(`/seller-inventory/seller/${selectedSellerId}`)
        .then((res) => {
          setInventory(res.data);
          setValue("inventoryItemId", "");
          setSelectedProduct(null);
        })
        .catch(() => {
          toast.error("Failed to load seller inventory");
        })
        .finally(() => {
          setInventoryLoading(false);
        });
    } else {
      setInventory([]);
    }
  }, [selectedSellerId, setValue]);

  // Update selected product details
  useEffect(() => {
    if (selectedInventoryId) {
      const product = inventory.find((item) => item._id === selectedInventoryId);
      if (product) {
        setSelectedProduct(product);
        setValue("sellingPrice", product.price.toString());
      }
    } else {
      setSelectedProduct(null);
    }
  }, [selectedInventoryId, inventory, setValue]);

  const onSubmit: SubmitHandler<ImportFormValues> = async (data) => {
    if (!selectedProduct) return;

    const qty = parseInt(data.importQuantity);
    if (qty > selectedProduct.availableQuantity) {
      toast.error(`Cannot import more than available quantity (${selectedProduct.availableQuantity})`);
      return;
    }

    setImporting(true);
    try {
      await api.post("/seller-inventory/import", {
        inventoryItemId: data.inventoryItemId,
        sellerId: data.sellerId,
        importQuantity: qty,
        sellingPrice: parseFloat(data.sellingPrice),
        discount: data.discount ? parseFloat(data.discount) : 0,
        customTitle: data.customTitle,
        customDescription: data.customDescription,
      });

      toast.success("Product successfully imported to live store!");
      reset();
      navigate("/admin/products");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to import product");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* --- Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">Import Seller Product</h1>
          <p className="text-primary/50 text-sm">Select a seller → pick their product → import it into the live store.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-standard p-6 md:p-8 flex flex-col gap-8">
          {/* ============================== */}
          {/*       STEP 1 : SELECT SELLER    */}
          {/* ============================== */}
          <section>
            <h3 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-gray-200">Step 1: Select Seller</h3>
            {usersLoading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
              </div>
            ) : (
              <div className="relative w-full flex flex-col gap-2.5">
                <label className="absolute bg-white text-primary/50 px-2.5 text-[12px] left-3.5 -top-2 z-10">Seller</label>
                <select
                  {...register("sellerId")}
                  className={`w-full h-[50px] bg-white border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm px-2.5 py-2 caret-primary rounded-md transition-[border-color,box-shadow] duration-500 ease-in-out ${
                    errors.sellerId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- Select a Seller --</option>
                  {sellers.map((seller) => (
                    <option key={seller._id} value={seller._id}>
                      {seller.fullName} ({seller.email})
                    </option>
                  ))}
                </select>
                {errors.sellerId && <span className="text-sm text-red-500/85">{errors.sellerId.message}</span>}
              </div>
            )}
          </section>

          {/* ============================== */}
          {/*     STEP 2 : SELECT PRODUCT     */}
          {/* ============================== */}
          {selectedSellerId && (
            <section>
              <h3 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-gray-200">Step 2: Select Product from Inventory</h3>
              {inventoryLoading ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
                </div>
              ) : inventory.length === 0 ? (
                <div className="p-4 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-200">
                  ⚠️ This seller has no items in their inventory yet.
                </div>
              ) : (
                <div className="relative w-full flex flex-col gap-2.5">
                  <label className="absolute bg-white text-primary/50 px-2.5 text-[12px] left-3.5 -top-2 z-10">Product</label>
                  <select
                    {...register("inventoryItemId")}
                    className={`w-full h-[50px] bg-white border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm px-2.5 py-2 caret-primary rounded-md transition-[border-color,box-shadow] duration-500 ease-in-out ${
                      errors.inventoryItemId ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">-- Select a Product --</option>
                    {inventory.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.title} (Available: {item.availableQuantity} | Cost: ₹{item.price})
                      </option>
                    ))}
                  </select>
                  {errors.inventoryItemId && <span className="text-sm text-red-500/85">{errors.inventoryItemId.message}</span>}
                </div>
              )}
            </section>
          )}

          {/* ============================== */}
          {/*   STEP 3 : CONFIGURE IMPORT     */}
          {/* ============================== */}
          {selectedProduct && (
            <section>
              <h3 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-gray-200">Step 3: Import Settings</h3>

              {/* Product Info Card */}
              <div className="p-4 bg-primary/5 rounded-lg mb-6 border border-primary/10">
                <div className="text-xs text-primary/50 uppercase tracking-wide mb-1.5">Original Product Details</div>
                <div className="font-semibold text-primary text-lg">{selectedProduct.title}</div>
                <div className="text-sm text-primary/60 mt-1">
                  Category: {selectedProduct.category || "N/A"} &nbsp;|&nbsp; Brand: {selectedProduct.brand || "N/A"}
                </div>
                <div className="text-sm text-primary/60">
                  Cost Price: ₹{selectedProduct.price} &nbsp;|&nbsp; Available Qty: <strong>{selectedProduct.availableQuantity}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <InputField
                  type="number"
                  name="importQuantity"
                  label={`Import Qty (Max: ${selectedProduct.availableQuantity})`}
                  placeholder="e.g. 50"
                  register={register}
                  error={errors.importQuantity?.message}
                />

                <InputField
                  type="number"
                  name="sellingPrice"
                  label="Store Selling Price (₹)"
                  placeholder="e.g. 150"
                  register={register}
                  error={errors.sellingPrice?.message}
                />

                <InputField
                  type="number"
                  name="discount"
                  label="Discount % (Optional)"
                  placeholder="e.g. 10"
                  register={register}
                  error={errors.discount?.message}
                />
              </div>

              {/* Optional Overrides */}
              <h4 className="text-sm font-semibold text-primary/60 mb-3 uppercase tracking-wide">Overrides (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  type="text"
                  name="customTitle"
                  label="Custom Title"
                  placeholder="Leave blank to use original"
                  register={register}
                  error={errors.customTitle?.message}
                />
                <div className="relative w-full flex flex-col gap-2.5">
                  <label className="absolute bg-white text-primary/50 px-2.5 text-[12px] left-3.5 -top-2 z-10">Custom Description</label>
                  <textarea
                    {...register("customDescription")}
                    placeholder="Leave blank to use original"
                    rows={2}
                    className="w-full bg-white border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm px-2.5 py-3 caret-primary rounded-md placeholder:text-primary/50 placeholder:text-sm transition-[border-color,box-shadow] duration-500 ease-in-out resize-none"
                  ></textarea>
                </div>
              </div>
            </section>
          )}

          {/* --- Submit */}
          <div className="flex items-center justify-end pt-4 border-t border-gray-200">
            <CustomButton type="submit" isLoading={importing} disabled={!selectedProduct} className="min-w-[200px]">
              Import to Store
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportProduct;
