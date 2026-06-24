import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const auth = sessionStorage.getItem("data_authorized");
    if (auth === "1") {
      setAuthorized(true);
    } else {
      setAuthorized(false);
      navigate("/auth", { replace: true });
    }
  }, [location.pathname]);

  if (authorized === null) return null;
  if (!authorized) return null;
  return <>{children}</>;
}
