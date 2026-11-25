// --- Libraries
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, ShieldAlert, UserCheck } from "lucide-react";

// --- Auth Context
import { useAuth } from "@/context/useAuth";

// --- RTK
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { registerUser, resetAuthState } from "@features/auth/authSlice";

// --- Components
import InputField from "@components/inputs/InputField";
import PasswordField from "@components/inputs/PasswordField";
import CustomButton from "@components/custom-button/CustomButton";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "./register/GoogleIcon";

// --- Utils
import { t } from "@/utils/i18n";
import { cn } from "@utils/cn";

// --- Password Validation
const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

// --- Register Schema
const RegisterSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, { message: "Name must be at least 3 characters" })
      .max(21, { message: "Name must not exceed 21 characters" }),
    email: z.string().email({ message: "Invalid Email Address" }).trim(),
    accountType: z.enum(["customer", "admin"]),
    password: passwordValidation,
    confirmPassword: z.string().trim().min(8, { message: "Confirm Password must be at least 8 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });
type RegisterSchemaType = z.infer<typeof RegisterSchema>;

// --- Main Component
const Register = () => {
  // --- Custom RTK Hooks
  const { loading, error: authError } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { signInWithGoogle } = useAuth();

  useEffect(() => {
    dispatch(resetAuthState());
  }, [dispatch]);

  // --- React Hook Form Logic
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RegisterSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      accountType: "customer",
    },
  });

  const selectedAccountType = watch("accountType");

  // --- OnSubmit Function
  const onSubmit: SubmitHandler<RegisterSchemaType> = async (data) => {
    setServerError("");
    setSuccessMessage("");

    // Security guard: public registration cannot grant Admin privileges.
    if (data.accountType === "admin") {
      const msg =
        "Admin registration is not authorized through public signup. Please register as a Customer and ask an existing administrator to assign Admin access.";
      setServerError(msg);
      toast.error(msg, { id: "register-toast" });
      return;
    }

    const payload = {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    };

    try {
      const message = await dispatch(registerUser(payload)).unwrap();
      setSuccessMessage(message);
      toast.success(message, { duration: 6000 });
      reset({ fullName: "", email: "", password: "", confirmPassword: "", accountType: "customer" });
    } catch (err) {
      const message = typeof err === "string" ? err : "Registration failed. Please check your details.";
      setServerError(message);
    }
  };

  // --- Google Login Handler
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setServerError("");
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const supaErr = err as { message?: string };
      setServerError(supaErr.message || t("auth.googleLoginFailed"));
    } finally {
      setGoogleLoading(false);
    }
  };

  const displayedError = serverError || authError;

  // --- Return JSX
  return (
    <div className="custom-container flex items-center justify-center flex-col gap-5 py-5 flex-1">
      <h1 className="text-primary mb-2.5 font-jetbrains text-center flex flex-col">
        <span className="max-sm:text-2xl text-3xl font-bold mb-2.5">Create New Account</span>
        <p className="max-sm:text-[12px] text-[14px] font-light">Sign up to start your shopping journey</p>
      </h1>

      <div className="bg-white rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-2xl w-fit mx-auto text-primary mt-5 mb-2.5 font-jetbrains">Register</h2>

        {displayedError && (
          <div
            role="alert"
            className="mb-4 mx-5 sm:mx-10 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-md text-center"
          >
            {displayedError}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mb-4 mx-5 sm:mx-10 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-md text-center"
          >
            {successMessage}
          </div>
        )}

        <form className="flex flex-col gap-5 max-sm:p-5 sm:px-10 sm:pb-10 rounded-lg w-full" onSubmit={handleSubmit(onSubmit)}>
          <InputField
            autoFocus
            type="text"
            placeholder="Enter your name"
            name="fullName"
            label="Name"
            register={register}
            error={errors.fullName?.message}
            autoComplete="name"
          />

          <InputField
            type="email"
            name="email"
            placeholder="Enter your email"
            label="Email"
            register={register}
            error={errors.email?.message}
            autoComplete="email"
          />

          {/* Account Type Selection */}
          <div className="flex flex-col gap-2">
            <span className="text-[12px] text-primary/70 font-medium px-1">Account Type</span>
            <input type="hidden" {...register("accountType")} />
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setValue("accountType", "customer", { shouldValidate: true });
                  setServerError("");
                }}
                aria-pressed={selectedAccountType === "customer"}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 px-3 rounded-md border text-sm font-medium transition-all cursor-pointer",
                  selectedAccountType === "customer"
                    ? "border-primary bg-primary text-white shadow-xs"
                    : "border-gray-300 bg-white text-primary hover:bg-gray-50",
                )}
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                Customer
              </button>

              <button
                type="button"
                onClick={() => {
                  setValue("accountType", "admin", { shouldValidate: true });
                  setServerError("");
                }}
                aria-pressed={selectedAccountType === "admin"}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 px-3 rounded-md border text-sm font-medium transition-all cursor-pointer",
                  selectedAccountType === "admin"
                    ? "border-amber-500 bg-amber-50 text-amber-900 shadow-xs"
                    : "border-gray-300 bg-white text-primary hover:bg-gray-50",
                )}
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                Admin
              </button>
            </div>

            {selectedAccountType === "admin" && (
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-2.5 leading-relaxed">
                Admin access cannot be self-assigned during public registration. An existing administrator must grant
                Admin privileges from Users Management after your account is created as a Customer.
              </div>
            )}
          </div>

          <PasswordField
            type="password"
            name="password"
            placeholder="Enter your password"
            label="Password"
            register={register}
            error={errors.password?.message}
            autoComplete="new-password"
          />

          <PasswordField
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            register={register}
            label="Confirm Password"
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
          />

          <CustomButton type="submit" aria-label="Submit form" isLoading={loading}>
            Register
          </CustomButton>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full font-medium rounded-md"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" strokeWidth={1.75} />
                {t("auth.connecting")}
              </>
            ) : (
              <>
                <GoogleIcon className="h-4 w-4 mr-2.5" />
                {t("auth.continueWithGoogle")}
              </>
            )}
          </Button>
        </form>
      </div>

      <p className="text-primary/75 select-none">
        Already have an account?
        <Link to="/login" state={location.state} className="text-blue-600/70 hover:text-blue-600 ml-0.5 cursor-pointer">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
