import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authorized = sessionStorage.getItem("data_authorized");
    if (authorized !== "1") {
      navigate("/auth", { replace: true });
    }
    setChecked(true);
  }, [navigate]);

  if (!checked) return null;
  return <>{children}</>;
}
