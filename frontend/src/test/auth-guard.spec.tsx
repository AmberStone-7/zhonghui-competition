import { describe, expect, test, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";

// Mock Navigate 组件，避免 MemoryRouter 内无路由的死循环
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => (
      <div data-testid="nav-redirect" data-to={to} />
    ),
  };
});

import { MemoryRouter } from "react-router-dom";
import AuthGuard from "../components/AuthGuard";

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

describe("AuthGuard — 数据授权流程补充", () => {
  // UI-AUTH-005: 已授权时渲染子组件
  test("UI-AUTH-005 — 已授权时渲染子组件", () => {
    sessionStorage.setItem("data_authorized", "1");
    const { container } = render(
      <MemoryRouter>
        <AuthGuard>
          <div data-testid="protected-content">Protected</div>
        </AuthGuard>
      </MemoryRouter>
    );
    expect(container.querySelector('[data-testid="protected-content"]')).toBeTruthy();
  });

  // UI-AUTH-006: 未授权时渲染 Navigate 重定向而非子组件
  test("UI-AUTH-006 — 未授权时重定向不渲染子组件", () => {
    sessionStorage.removeItem("data_authorized");
    const { container } = render(
      <MemoryRouter>
        <AuthGuard>
          <div data-testid="protected-content">Protected</div>
        </AuthGuard>
      </MemoryRouter>
    );
    // 未授权时 AuthGuard 返回 mock Navigate，不带 children
    expect(container.querySelector('[data-testid="protected-content"]')).toBeNull();
    const navRedirect = container.querySelector('[data-testid="nav-redirect"]');
    expect(navRedirect).toBeTruthy();
    expect(navRedirect!.getAttribute("data-to")).toBe("/auth");
  });
});
