import { storage } from "../utils/storage";
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
    token: storage.getItem("admin_token"),
    role: storage.getItem("admin_role"),
    isAuthenticated: !!storage.getItem("admin_token"),
  }));

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await api.post("/api/admin/login", { username, password });
      const { token, role } = res.data;
      storage.setItem("admin_token", token);
      storage.setItem("admin_role", role);
      storage.removeItem("mock_mode");
      setState({ token, role, isAuthenticated: true });
      return role;
    } catch {
      // Fallback to mock login for demo/preview
      const { token, role } = mockLogin(username, password);
      storage.setItem("admin_token", token);
      storage.setItem("admin_role", role);
      storage.setItem("mock_mode", "1");
      setState({ token, role, isAuthenticated: true });
      return role;
    }
  }, []);

  const logout = useCallback(() => {
    storage.removeItem("admin_token");
    storage.removeItem("admin_role");
    storage.removeItem("mock_mode");
    setState({ token: null, role: null, isAuthenticated: false });
  }, []);

  return { ...state, login, logout };
}
