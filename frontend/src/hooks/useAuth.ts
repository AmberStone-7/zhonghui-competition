import { useState, useCallback } from "react";
import api from "../api/client";
import { mockLogin } from "../api/mock";

interface AuthState {
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => ({
    token: sessionStorage.getItem("admin_token"),
    role: sessionStorage.getItem("admin_role"),
    isAuthenticated: !!sessionStorage.getItem("admin_token"),
  }));

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await api.post("/api/admin/login", { username, password });
      const { token, role } = res.data;
      sessionStorage.setItem("admin_token", token);
      sessionStorage.setItem("admin_role", role);
      sessionStorage.removeItem("mock_mode");
      setState({ token, role, isAuthenticated: true });
      return role;
    } catch {
      // Fallback to mock login for demo/preview
      const { token, role } = mockLogin(username, password);
      sessionStorage.setItem("admin_token", token);
      sessionStorage.setItem("admin_role", role);
      sessionStorage.setItem("mock_mode", "1");
      setState({ token, role, isAuthenticated: true });
      return role;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_role");
    sessionStorage.removeItem("mock_mode");
    setState({ token: null, role: null, isAuthenticated: false });
  }, []);

  return { ...state, login, logout };
}
