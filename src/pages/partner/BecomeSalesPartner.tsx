// --- Libraries
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Check } from "lucide-react";
import axios from "axios";

// --- Utils
import api from "@utils/api";

// --- Components
import InputField from "@components/inputs/InputField";
import CustomButton from "@components/custom-button/CustomButton";

// --- Form Validation Schema
const PartnerSchema = z.object({
  companyName: z.string().trim().min(2, "Company Name is required"),
  designation: z.string().trim().min(2, "Designation is required"),
  companyWebsite: z.string().trim().url("Must be a valid URL").or(z.literal("")),
  gstin: z.string().trim().min(15, "GSTIN must be 15 characters").max(15, "GSTIN must be 15 characters"),
  companyDescription: z.string().trim().min(10, "Description is required"),
  pan: z.string().trim().length(10, "PAN must be exactly 10 characters").toUpperCase(),
  facebook: z.string().trim().url("Must be a valid URL").or(z.literal("")),
  instagram: z.string().trim().url("Must be a valid URL").or(z.literal("")),
  googleBusiness: z.string().trim().url("Must be a valid URL").or(z.literal("")),
  contactNumber: z.string().trim().regex(/^[0-9]{10}$/, "Must be exactly 10 digits"),
  email: z.string().trim().email("Invalid Email Address"),
  address: z.string().trim().min(5, "Address is required"),
});

type PartnerSchemaType = z.infer<typeof PartnerSchema>;

const BecomeSalesPartner = () => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PartnerSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(PartnerSchema),
  });

  const gstinValue = watch("gstin");
  const isGstinValid = gstinValue?.length === 15;

  const onSubmit: SubmitHandler<PartnerSchemaType> = async (data) => {
    setLoading(true);
    try {
      const response = await api.post("/v1/partners", data);
      toast.success(response.data.message || "Application submitted successfully!");
      reset();
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to submit application. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-container py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100 p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 font-jetbrains text-center">Become a Sales Partner</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputField
              type="text"
              name="companyName"
              label="Company Name"
              placeholder="Enter company name"
              register={register}
              error={errors.companyName?.message}
            />
            <InputField
              type="text"
              name="designation"
              label="Designation"
              placeholder="Enter designation"
              register={register}
              error={errors.designation?.message}
            />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <InputField
              type="text"
              name="companyWebsite"
              label="Company Website"
              placeholder="Enter website URL"
              register={register}
              error={errors.companyWebsite?.message}
            />
            
            <div className="flex items-start gap-3 w-full">
              <div className="flex-1">
                <InputField
                  type="text"
                  name="gstin"
                  label="GSTIN"
                  placeholder="Enter 15-digit GSTIN"
                  register={register}
                  error={errors.gstin?.message}
                />
              </div>
              {isGstinValid && !errors.gstin && (
                <div className="bg-[#82d8c9] w-12 h-[50px] mt-[26px] rounded-md flex items-center justify-center text-white shrink-0 shadow-sm transition-all duration-300">
                  <Check size={24} strokeWidth={3} />
                </div>
              )}
            </div>
          </div>

          {/* Row 3 - Description */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-gray-600">Company Description</label>
            <textarea
              {...register("companyDescription")}
              placeholder="Tell us about your business, products, services, or core industry focus..."
              className={`w-full min-h-[140px] p-4 text-sm border rounded-md resize-y outline-none transition-colors focus:border-primary ${
                errors.companyDescription ? "border-red-500 bg-red-50/30" : "border-gray-200"
              }`}
            ></textarea>
            {errors.companyDescription && (
              <span className="text-xs text-red-500 mt-0.5">{errors.companyDescription.message}</span>
            )}
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputField
              type="text"
              name="pan"
              label="PAN"
              placeholder="Enter PAN"
              register={register}
              error={errors.pan?.message}
            />
            <InputField
              type="text"
              name="facebook"
              label="Facebook"
              placeholder="https://"
              register={register}
              error={errors.facebook?.message}
            />
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputField
              type="text"
              name="instagram"
              label="Instagram"
              placeholder="https://"
              register={register}
              error={errors.instagram?.message}
            />
            <InputField
              type="text"
              name="googleBusiness"
              label="Google Business"
              placeholder="https://"
              register={register}
              error={errors.googleBusiness?.message}
            />
          </div>

          {/* Row 6 - Added Extra Fields */}
          <div className="border-t border-gray-100 pt-8 mt-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputField
              type="tel"
              name="contactNumber"
              label="Contact Number"
              placeholder="Enter phone number"
              register={register}
              error={errors.contactNumber?.message}
            />
            <InputField
              type="email"
              name="email"
              label="Email"
              placeholder="Enter email address"
              register={register}
              error={errors.email?.message}
            />
          </div>

          {/* Row 7 - Address */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-gray-600">Address</label>
            <textarea
              {...register("address")}
              placeholder="Enter complete company address"
              className={`w-full min-h-[100px] p-4 text-sm border rounded-md resize-y outline-none transition-colors focus:border-primary ${
                errors.address ? "border-red-500 bg-red-50/30" : "border-gray-200"
              }`}
            ></textarea>
            {errors.address && (
              <span className="text-xs text-red-500 mt-0.5">{errors.address.message}</span>
            )}
          </div>

          {/* Submit */}
          <div className="mt-4 flex justify-center md:justify-end">
            <CustomButton type="submit" isLoading={loading} className="w-full md:w-48 py-3 text-lg">
              Submit Application
            </CustomButton>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default BecomeSalesPartner;
