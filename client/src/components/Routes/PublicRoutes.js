import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/auth";

const PublicRoutes = () => {
  const [auth] = useAuth();

  return auth?.token ? <Navigate to="/quiz-selection" replace /> : <Outlet />;
};

export default PublicRoutes;
