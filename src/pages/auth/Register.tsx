// --- Libraries
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

// --- Auth Context
import { useAuth } from "@/context/useAuth";

// --- RTK
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { registerUser } from "@features/auth/authSlice";

// --- Components
import InputField from "@components/inputs/InputField";
import PasswordField from "@components/inputs/PasswordField";
import CustomButton from "@components/custom-button/CustomButton";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "./register/GoogleIcon";

// --- Utils
import { t } from "@/utils/i18n";

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
      .min(3, { message: "Full Name must be at least 3 characters" })
      .max(21, { message: "Full Name must not exceed 21 characters" }),
    email: z.string().email({ message: "Invalid Email Address" }).trim(),
    phone: z.string().regex(/^[0-9]{10}$/, { message: "Phone Number must be exactly 10 digits" }).trim(),
    password: passwordValidation,
    confirmPassword: z.string().trim().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });
type RegisterSchemaType = z.infer<typeof RegisterSchema>;

// --- Main Component
const Register = () => {
  // --- Custom RTK Hooks
  const { loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const { signInWithGoogle } = useAuth();

  // --- React Hook Form Logic
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(RegisterSchema),
  });

  // --- OnSubmit Function
  const onSubmit: SubmitHandler<RegisterSchemaType> = async (data) => {
    const { confirmPassword: _, ...registerData } = data;

    const resultAction = await dispatch(registerUser(registerData));

    if (registerUser.fulfilled.match(resultAction)) {
      toast.success(resultAction.payload as string, { duration: 6000 });
      reset();
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

  // --- Return JSX
  return (
    <div className="custom-container flex items-center justify-center flex-col gap-5 py-5 flex-1">
      <h1 className="text-primary mb-2.5 font-jetbrains text-center flex flex-col">
        <span className="max-sm:text-2xl text-3xl font-bold mb-2.5">Create New Account</span>
        <p className="max-sm:text-[12px] text-[14px] font-light">Sign up to start your shopping journey</p>
      </h1>

      <div className="bg-white rounded-xl w-full max-w-md">
        <h2 className="text-2xl w-fit mx-auto text-primary mt-5 mb-2.5 font-jetbrains">Register</h2>
        {serverError && (
          <div className="mb-4 mx-5 sm:mx-10 text-sm text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-md text-center">
            {serverError}
          </div>
        )}
        <form
          className="shadow-lg flex flex-col gap-5 max-sm:p-5 sm:px-10 sm:pb-10 rounded-lg w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <InputField
            autoFocus
            type="text"
            placeholder="Enter your Full Name"
            name="fullName"
            label="Full Name"
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
          <InputField
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            label="Phone Number"
            register={register}
            error={errors.phone?.message}
            autoComplete="tel"
          />
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
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" strokeWidth={1.75} />{t("auth.connecting")}</>
            ) : (
              <><GoogleIcon className="h-4 w-4 mr-2.5" />{t("auth.continueWithGoogle")}</>
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
