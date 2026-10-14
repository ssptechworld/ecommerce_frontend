import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAppDispatch } from "@app/hooks";
import { setCredentials } from "@features/auth/authSlice";
import api from "@utils/api";
import { Loader2 } from "lucide-react";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const token = searchParams.get("token");
      if (!token) {
        console.error("No token returned in OAuth callback");
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = {
          ...response.data,
          token,
        };

        dispatch(setCredentials(userData));
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Error fetching user profile after OAuth:", error);
        navigate("/login", { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams, dispatch]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-sm text-gray-600">Completing Google Sign In...</p>
    </div>
  );
};

export default AuthCallback;
