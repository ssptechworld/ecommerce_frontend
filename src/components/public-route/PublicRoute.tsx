// --- Libraries
import { Navigate, Outlet, useLocation } from "react-router";

// --- RTK
import { useAppSelector } from "@app/hooks";

// --- Main Component
const PublicRoute = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (isAuthenticated) {
    if (user?.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
