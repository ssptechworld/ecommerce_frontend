// --- Libraries
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

// --- RTK & Auth Context
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { loginUser, resetAuthState } from "@features/auth/authSlice";
import { useAuth } from "@/context/useAuth";

// --- Components
import InputField from "@components/inputs/InputField";
import PasswordField from "@components/inputs/PasswordField";
import CustomButton from "@components/custom-button/CustomButton";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "./register/GoogleIcon";

// --- Utils
import { t } from "@/utils/i18n";

// --- Login Schema
const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid Email Address" }).trim(),
  password: z.string().trim().min(8, { message: "Password must be at least 8 characters" }),
});
type LoginSchemaType = z.infer<typeof LoginSchema>;

// --- Main Component
const Login = () => {
  // --- Custom RTK Hooks & Auth State
  const { loading, error: authError } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const { signInWithGoogle } = useAuth();

  useEffect(() => {
    dispatch(resetAuthState());
  }, [dispatch]);

  // --- React Hook Form Logic
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(LoginSchema),
  });

  // --- Quick-fill helpers
  const fillAdmin = () => {
    setValue("email", "admin@mail.com", { shouldValidate: true });
    setValue("password", "Password@2026", { shouldValidate: true });
  };
  const fillCustomer = () => {
    setValue("email", "customer@mail.com", { shouldValidate: true });
    setValue("password", "Password@2026", { shouldValidate: true });
  };

  // --- OnSubmit Function
  const onSubmit: SubmitHandler<LoginSchemaType> = async (data) => {
    setServerError("");
    try {
      const authenticatedUser = await dispatch(loginUser(data)).unwrap();
      // Route strictly based on the authenticated user role returned by the backend API
      if (authenticatedUser.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname;
        const safeTarget = fromPath && !fromPath.startsWith("/admin") ? fromPath : "/";
        navigate(safeTarget, { replace: true });
      }
    } catch (err) {
      const message = typeof err === "string" ? err : "Login failed. Please check your credentials.";
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
      {/* Title */}
      <h1 className="text-primary mb-2.5 font-jetbrains text-center flex flex-col">
        <span className="max-sm:text-2xl text-3xl font-bold mb-2.5">Welcome back</span>
        <p className="max-sm:text-[12px] text-[14px] font-light">Log in to continue your shopping experience</p>
      </h1>

      {/* Quick-fill demo buttons */}
      <div className="flex flex-wrap justify-center gap-3 w-full">
        <button
          type="button"
          id="quick-fill-admin"
          aria-label="Fill admin credentials"
          onClick={fillAdmin}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium border border-red-400/60 text-red-600 bg-red-50 hover:bg-red-100 active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Login as Admin
        </button>
        <button
          type="button"
          id="quick-fill-customer"
          aria-label="Fill customer credentials"
          onClick={fillCustomer}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium border border-blue-400/60 text-blue-600 bg-blue-50 hover:bg-blue-100 active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          Login as Customer
        </button>
      </div>

      {/* Login Form */}
      <div className="bg-white rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-2xl w-fit mx-auto text-primary mt-5 mb-2.5 font-jetbrains">Login</h2>
        {displayedError && (
          <div
            role="alert"
            className="mb-4 mx-5 sm:mx-10 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-md text-center"
          >
            {displayedError}
          </div>
        )}
        <form
          className="flex flex-col gap-5 max-sm:p-5 sm:px-10 sm:pb-10 rounded-lg w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <InputField
            type="email"
            name="email"
            placeholder="Enter your email"
            register={register}
            label="Email"
            error={errors.email?.message}
            autoComplete="email"
          />
          <PasswordField
            type="password"
            name="password"
            placeholder="Enter your password"
            register={register}
            label="Password"
            error={errors.password?.message}
            autoComplete="current-password"
          />
          <Link to="/reset-password" className="-mt-2.5 text-[14px] text-blue-600/70 hover:text-blue-600">
            Forgot Password?
          </Link>
          <CustomButton type="submit" aria-label="Submit form" isLoading={loading}>
            Login
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
        Don't have an account?
        <Link to="/register" state={location.state} className="text-blue-600/70 hover:text-blue-600 ml-0.5 cursor-pointer">
          Register
        </Link>
      </p>
    </div>
  );
};
export default Login;
