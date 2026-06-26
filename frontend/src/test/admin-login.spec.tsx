import { describe, expect, test, vi, afterEach, beforeEach } from "vitest";
import { render, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../hooks/useAuth", () => ({ useAuth: vi.fn() }));
import { useAuth } from "../hooks/useAuth";
import Login from "../pages/admin/Login";
import ProtectedRoute from "../components/ProtectedRoute";

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

beforeEach(() => {
  sessionStorage.clear();
  mockUseAuth.mockReturnValue({ login: vi.fn(), role: null, logout: vi.fn() });
});

afterEach(() => cleanup());

describe("Admin Login — 管理员登录", () => {
  test("UI-LOGIN-001 — 登录表单渲染", () => {
    const { container } = render(<MemoryRouter><Login /></MemoryRouter>);
    expect(container.textContent).toContain("管理后台登录");
    expect(container.querySelector('input[placeholder*="用户名"]')).toBeTruthy();
    expect(container.querySelector('input[type="password"]')).toBeTruthy();
  });

  test("UI-LOGIN-002 — 登录成功 SuperAdmin 跳转", async () => {
    const mockLogin = vi.fn().mockResolvedValueOnce("super_admin");
    mockUseAuth.mockReturnValue({ login: mockLogin, role: null, logout: vi.fn() });
    const { container } = render(<MemoryRouter><Login /></MemoryRouter>);
    const userInput = container.querySelector('input[placeholder*="用户名"]') as HTMLInputElement;
    const pwdInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    if (userInput) fireEvent.change(userInput, { target: { value: "admin" } });
    if (pwdInput) fireEvent.change(pwdInput, { target: { value: "admin123" } });
    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) fireEvent.click(submitBtn);
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith("admin", "admin123"));
  });

  test("UI-LOGIN-003 — 登录失败提示错误", async () => {
    const mockLogin = vi.fn().mockRejectedValueOnce({
      response: { data: { message: "用户名或密码错误" }, status: 401 },
    });
    mockUseAuth.mockReturnValue({ login: mockLogin, role: null, logout: vi.fn() });
    const { container } = render(<MemoryRouter><Login /></MemoryRouter>);
    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(container.querySelector(".text-red-600")).toBeTruthy();
    });
  });

  test("UI-LOGIN-004 — 账户锁定提示", async () => {
    const mockLogin = vi.fn().mockRejectedValueOnce({
      response: { data: { message: "账户已锁定" }, status: 423 },
    });
    mockUseAuth.mockReturnValue({ login: mockLogin, role: null, logout: vi.fn() });
    const { container } = render(<MemoryRouter><Login /></MemoryRouter>);
    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(container.querySelector(".text-red-600")).toBeTruthy();
    });
  });

  test("UI-LOGIN-005 — ProtectedRoute 守卫未登录时阻止访问", () => {
    sessionStorage.removeItem("admin_token");
    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute><div data-testid="admin">Admin</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(container.querySelector('[data-testid="admin"]')).toBeNull();
  });
});
