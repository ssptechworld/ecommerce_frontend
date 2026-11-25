// --- Libraries
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";

// --- RTK
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { logout } from "@features/auth/authSlice";

// --- Utils
import { isTokenValid } from "@utils/authSession";

// --- Types
type ProtectedRouteProps = {
  adminOnly?: boolean;
};

// --- Main Component
const ProtectedRoute = ({ adminOnly = false }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  const hasValidSession = isAuthenticated && Boolean(user?.token) && isTokenValid(user?.token);

  useEffect(() => {
    if (isAuthenticated && !hasValidSession) {
      dispatch(logout());
    }
  }, [dispatch, isAuthenticated, hasValidSession]);

  if (!hasValidSession) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
