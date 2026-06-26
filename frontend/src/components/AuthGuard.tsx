import { storage } from "../utils/storage";
import { Navigate, useLocation } from "react-router-dom";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const authorized = storage.getItem("data_authorized") === "1";

  if (!authorized) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
