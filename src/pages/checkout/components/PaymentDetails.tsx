// --- Libraries
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import axios from "axios";

// --- React Icons
import { GiWrappingStar } from "react-icons/gi";

// --- RTK
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { createOrder } from "@features/orders/ordersSlice";
import { clearCart } from "@features/cart/cartSlice";
import { updateProfile } from "@features/auth/authSlice";

// --- Local Components
import InputField from "@components/inputs/InputField";
import CustomButton from "@components/custom-button/CustomButton";

// --- Axios API Client
import api from "@utils/api";

// --- Address Schema
const AddressSchema = z.object({
  fullName: z.string().trim().min(3, "Name must be at least 3 characters").max(21),
  city: z.string().min(3, "City is required").trim(),
  area: z.string().min(3, "Area is required").trim(),
  street: z.string().min(3, "Street is required").trim(),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits").trim(),
});
type AddressSchemaType = z.infer<typeof AddressSchema>;

import { STORE_CONFIG } from "@/config/storeConfig";

// --- Main Component
const PaymentDetails = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // --- RTK State
  const { loading: authLoading, user } = useAppSelector((state) => state.auth);
  const { cart } = useAppSelector((state) => state.cart);
  const { loading } = useAppSelector((state) => state.orders);

  // --- Payment Method State
  const [payMethod, setPayMethod] = useState<"cash" | "card">("card");

  // --- Address Validation State
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validatingAddress, setValidatingAddress] = useState(false);

  // --- Billing Address Hook Form Logic
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<AddressSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      fullName: "",
      city: "",
      area: "",
      street: "",
      phone: "",
    },
  });

  // --- Auto-fill user form data
  useEffect(() => {
    if (user)
      reset({
        fullName: user.fullName,
        city: user.address?.city || "",
        area: user.address?.area || "",
        street: user.address?.street || "",
        phone: user.address?.phone || "",
      });
  }, [reset, user]);

  // --- Submit Form
  const onSubmit: SubmitHandler<AddressSchemaType> = async (data) => {
    setValidationError(null);
    setValidatingAddress(true);

    const { fullName, ...addressData } = data;

    // 1. AI Address Validation
    try {
      const valRes = await api.post("/orders/validate-address", addressData);
      if (valRes.data && valRes.data.valid === false) {
        setValidationError(valRes.data.message);
        setValidatingAddress(false);
        return;
      }
    } catch (err) {
      console.warn("AI Address validation bypassed due to service error: ", err);
    }

    setValidatingAddress(false);

    const baseOrderData = {
      customerName: fullName,
      email: user?.email || "",
      orderItems: cart.map(item => ({
        productId: item.productId,
        title: item.title,
        price: item.price,
        count: item.count,
        image: item.image,
        category: item.category
      })),
      shippingAddress: addressData,
      paymentMethod: payMethod,
    };

    if (payMethod === "cash") {
      const resultAction = await dispatch(createOrder(baseOrderData));
      if (createOrder.fulfilled.match(resultAction)) {
        dispatch(clearCart());
        toast.success("🎉 Order placed successfully! Your order is on its way.", {
          duration: 4000,
          style: {
            background: "#1a2332",
            color: "#fff",
            border: "1px solid #f59e0b",
            borderRadius: "12px",
            padding: "14px 18px",
            fontWeight: "500",
          },
        });
        setTimeout(() => navigate("/profile/orders"), 1500);
      }
      return;
    }

    // Online payment flow via Razorpay
    try {
      // 1. Get Razorpay Order ID from backend
      const res = await api.post("/orders/payment-order", baseOrderData);
      const { id: razorpayOrderId, amount, currency } = res.data;

      // 2. Configure checkout overlay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_SneTB4Cw1IDk1n",
        amount: amount,
        currency: currency,
        name: STORE_CONFIG.name,
        description: "E-Commerce Transaction",
        image: "/logo.svg",
        order_id: razorpayOrderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const finalOrderData = {
            ...baseOrderData,
            paymentMethod: "card" as "card" | "cash",
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          };

          const resultAction = await dispatch(createOrder(finalOrderData));
          if (createOrder.fulfilled.match(resultAction)) {
            dispatch(clearCart());
            toast.success("✅ Payment successful! Your order has been confirmed.", {
              duration: 4000,
              style: {
                background: "#1a2332",
                color: "#fff",
                border: "1px solid #22c55e",
                borderRadius: "12px",
                padding: "14px 18px",
                fontWeight: "500",
              },
            });
            setTimeout(() => navigate("/profile/orders"), 1500);
          }
        },
        prefill: {
          name: fullName,
          email: user?.email || "",
          contact: addressData.phone,
        },
        theme: {
          color: "#34465b",
        },
      };

      const RazorpayCtor = (
        window as unknown as {
          Razorpay: new (opts: Record<string, unknown>) => {
            on: (event: string, cb: (res: { error: { description: string } }) => void) => void;
            open: () => void;
          };
        }
      ).Razorpay;
      const rzp = new RazorpayCtor(options);
      rzp.on("payment.failed", (response) => {
        alert("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : "Unknown error";
      alert("Error starting payment flow: " + msg);
    }
  };

  // --- Handle Update Profile
  const isAddressChanged =
    dirtyFields.fullName || dirtyFields.city || dirtyFields.area || dirtyFields.street || dirtyFields.phone;

  const handleUpdateProfile = async () => {
    const isValid = await trigger(["fullName", "city", "area", "street", "phone"]);

    if (isValid) {
      const values = getValues();
      const updatePayload = {
        fullName: values.fullName,
        address: {
          city: values.city,
          area: values.area,
          street: values.street,
          phone: values.phone,
        },
      };
      dispatch(updateProfile(updatePayload));
    }
  };

  // --- Return JSX
  return (
    <div className="p-2.5 rounded-md bg-white shadow-md text-neutral-800">
      <h2 className="relative w-fit text-primary/60 text-2xl font-jetbrains select-none mb-5 before:-bottom-1 before:absolute before:w-full before:h-0.5 before:bg-warning before:rounded-[100%]">
        CHECKOUT
      </h2>
      <form className="max-sm:p-3 sm:px-10 sm:pb-10 rounded-lg mt-6 sm:mt-10" onSubmit={handleSubmit(onSubmit)}>
        {/* 1. Address Section */}
        <h3 className="relative w-fit text-primary/60 text-lg font-jetbrains select-none mb-10 before:-bottom-1 before:absolute before:w-full before:h-0.5 before:bg-warning before:rounded-[100%]">
          1. Billing Address
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            type="text"
            name="fullName"
            placeholder="Enter your name"
            register={register}
            label="Full Name"
            error={errors.fullName?.message}
            autoComplete="name"
          />
          <InputField
            type="text"
            name="city"
            placeholder="Enter your city"
            register={register}
            label="City"
            error={errors.city?.message}
            autoComplete="address-level1"
          />
          <InputField
            type="text"
            name="area"
            placeholder="Enter your area"
            register={register}
            label="Area"
            error={errors.area?.message}
            autoComplete="address-level2"
          />
          <InputField
            type="text"
            name="street"
            placeholder="Enter your street"
            register={register}
            label="Street"
            error={errors.street?.message}
            autoComplete="address-level3"
          />
          <InputField
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            register={register}
            label="Phone Number"
            error={errors.phone?.message}
            autoComplete="mobile tel"
          />
          {isAddressChanged && (
            <CustomButton
              onClick={handleUpdateProfile}
              isLoading={authLoading}
              type="button"
              className="px-5 w-full sm:w-auto sm:ml-auto mt-5"
            >
              Save Changes
            </CustomButton>
          )}
        </div>

        {/* Horizontal Break */}
        <span className="flex items-center justify-center gap-2.5 w-1/2 my-7 mx-auto">
          <span className="w-[40%] h-px bg-gray-400/50"></span>
          <GiWrappingStar className="text-gray-400/50" size={15} />
          <span className="w-[40%] h-px bg-gray-400/50"></span>
        </span>

        {/* 2. Payment Section */}
        <h3 className="relative w-fit text-primary/60 text-lg font-jetbrains select-none mb-10 before:-bottom-1 before:absolute before:w-full before:h-0.5 before:bg-warning before:rounded-[100%]">
          2. Payment Method
        </h3>
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3 cursor-pointer bg-neutral-50 hover:bg-neutral-100/70 p-4 rounded-lg border border-neutral-200 transition-colors">
            <input
              type="radio"
              name="paymentMethod"
              checked={payMethod === "card"}
              onChange={() => setPayMethod("card")}
              className="accent-warning w-4 h-4"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-neutral-800">Online Payment via Razorpay</span>
              <span className="text-xs text-neutral-500">Pay securely with UPI, Credit/Debit Card, or Netbanking</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer bg-neutral-50 hover:bg-neutral-100/70 p-4 rounded-lg border border-neutral-200 transition-colors">
            <input
              type="radio"
              name="paymentMethod"
              checked={payMethod === "cash"}
              onChange={() => setPayMethod("cash")}
              className="accent-warning w-4 h-4"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-neutral-800">Cash on Delivery (COD)</span>
              <span className="text-xs text-neutral-500">Pay with cash upon package delivery</span>
            </div>
          </label>

          {validationError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-700 text-xs px-4 py-3 rounded-lg font-semibold my-2 animate-in fade-in duration-300">
              ⚠️ Address Guard: {validationError}
            </div>
          )}

          {!isAddressChanged && (
            <CustomButton
              isLoading={loading || validatingAddress}
              type="submit"
              className="px-6 w-full sm:w-auto sm:ml-auto mt-6"
            >
              {validatingAddress ? "Checking Address..." : payMethod === "card" ? "Pay & Place Order" : "Place Order (COD)"}
            </CustomButton>
          )}
        </div>
      </form>
    </div>
  );
};

export default PaymentDetails;
