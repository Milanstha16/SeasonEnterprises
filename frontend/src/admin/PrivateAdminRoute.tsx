// frontend/components/PrivateAdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const PrivateAdminRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/home" replace />; // Not logged in
  if (user?.role !== "admin") return <Navigate to="/home" replace />; // Not admin

  return children;
};

export default PrivateAdminRoute;
