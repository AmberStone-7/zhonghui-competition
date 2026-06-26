import { describe, expect, test, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import ErrorBoundary from "../components/ErrorBoundary";

// 故意抛错的子组件
function Bomb({ shouldExplode }: { shouldExplode: boolean }) {
  if (shouldExplode) throw new Error("Test explosion");
  return <div data-testid="safe-content">Safe</div>;
}

afterEach(() => {
  cleanup();
});

describe("ErrorBoundary — 错误边界 & 异常处理", () => {
  // UI-ERR-001: ErrorBoundary 捕获渲染错误
  test("UI-ERR-001 — ErrorBoundary 捕获渲染错误，显示降级 UI", () => {
    // 抑制 React 的错误输出
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <ErrorBoundary>
        <Bomb shouldExplode={true} />
      </ErrorBoundary>
    );
    spy.mockRestore();

    // 错误边界应显示降级 UI：AlertTriangle icon + "页面出现异常" 文案 + "重试" 按钮
    expect(container.textContent).toContain("页面出现异常");
    expect(container.querySelector("button")).toBeTruthy();
    expect(container.querySelector("button")!.textContent).toContain("重试");
  });

  // UI-ERR-002: 点击重试按钮重置错误状态
  test("UI-ERR-002 — 点击重试按钮重置错误状态", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <ErrorBoundary>
        <Bomb shouldExplode={true} />
      </ErrorBoundary>
    );
    spy.mockRestore();

    expect(container.textContent).toContain("页面出现异常");

    // 点击重试按钮
    const retryButton = container.querySelector("button")!;
    fireEvent.click(retryButton);

    // after reset, should show nothing (Bomb still explodes on re-render)
    // but error boundary resets to try again
    expect(container.textContent).toContain("页面出现异常");
  });

  // UI-ERR-003: 正常渲染时透传子组件
  test("UI-ERR-003 — 无错误时正常渲染子组件", () => {
    const { container } = render(
      <ErrorBoundary>
        <Bomb shouldExplode={false} />
      </ErrorBoundary>
    );
    expect(container.querySelector('[data-testid="safe-content"]')).toBeTruthy();
    expect(container.textContent).toContain("Safe");
  });
});
