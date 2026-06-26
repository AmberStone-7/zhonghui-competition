import { storage } from "../utils/storage";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = storage.getItem("admin_token");
  if (!token) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
