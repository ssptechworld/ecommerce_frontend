// --- Libraries
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";

// --- RTK
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { logout } from "@features/auth/authSlice";

// --- Utils
import { isTokenValid } from "@utils/authSession";

// --- Main Component
const PublicRoute = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  const hasValidSession = isAuthenticated && Boolean(user?.token) && isTokenValid(user?.token);

  useEffect(() => {
    if (isAuthenticated && !hasValidSession) {
      dispatch(logout());
    }
  }, [dispatch, isAuthenticated, hasValidSession]);

  if (hasValidSession) {
    if (user?.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    const from = (location.state as { from?: { pathname?: string } })?.from?.pathname;
    const safeTarget = from && !from.startsWith("/admin") ? from : "/";
    return <Navigate to={safeTarget} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
