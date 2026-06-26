import { describe, expect, test, vi, afterEach, beforeEach } from "vitest";
import { render, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "../hooks/useLanguage";

vi.mock("../api/client", () => ({ default: { post: vi.fn() } }));
import api from "../api/client";
import Register from "../pages/Register";

const mockPost = api.post as ReturnType<typeof vi.fn>;

function renderRegister() {
  return render(
    <LanguageProvider>
      <MemoryRouter><Register /></MemoryRouter>
    </LanguageProvider>
  );
}

function createMockFile(name = "test.jpg", sizeKB = 100) {
  return new File([new Uint8Array(sizeKB * 1024)], name, { type: "image/jpeg" });
}

// 填写报名表单的辅助函数
function fillForm(container: HTMLElement, fields: Record<string, string>) {
  const get = (p: string) => container.querySelector(`input[placeholder="${p}"]`) as HTMLInputElement;
  Object.entries(fields).forEach(([placeholder, value]) => {
    const el = get(placeholder);
    if (el) fireEvent.change(el, { target: { value } });
  });
}

beforeEach(() => {
  sessionStorage.setItem("data_authorized", "1");
  mockPost.mockReset();
});

afterEach(() => cleanup());

describe("Register — 报名上传页", () => {
  test("UI-REG-001 — 表单四字段渲染", () => {
    const { container } = renderRegister();
    expect(container.querySelector('input[placeholder="姓名"]')).toBeTruthy();
    expect(container.querySelector('input[placeholder="地址"]')).toBeTruthy();
    expect(container.querySelector('input[placeholder="电话"]')).toBeTruthy();
    expect(container.querySelector('input[placeholder="税号"]')).toBeTruthy();
  });

  test("UI-REG-002 — 图片上传区域，支持 JPEG/PNG/WebP/HEIC", () => {
    const { container } = renderRegister();
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeTruthy();
    const accept = fileInput!.getAttribute("accept") || "";
    expect(accept).toContain("image/jpeg");
    expect(accept).toContain("image/png");
  });

  test("UI-REG-003 — 上传图片后显示预览", () => {
    const { container } = renderRegister();
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });
    expect(container.querySelectorAll(".grid.grid-cols-3 img").length).toBeGreaterThanOrEqual(1);
  });

  test("UI-REG-004 — 点击删除按钮可移除图片", async () => {
    const { container } = renderRegister();
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });
    const before = container.querySelectorAll(".grid.grid-cols-3 img").length;
    const delBtn = container.querySelector(".grid.grid-cols-3 button");
    if (delBtn) {
      fireEvent.click(delBtn);
      await waitFor(() => {
        expect(container.querySelectorAll(".grid.grid-cols-3 img").length).toBeLessThan(before);
      });
    }
  });

  test("UI-REG-005 — 首次报名无手机号验证弹窗", () => {
    const { container } = renderRegister();
    expect(container.querySelector(".fixed.inset-0.bg-black\\/50")).toBeNull();
  });

  test("UI-REG-007 — 姓名为空时前端提示错误", async () => {
    const { container } = renderRegister();
    const submitBtn = container.querySelector('button:not([class*="upload"]):not([class*="top-1"])') as HTMLButtonElement;
    // 找提交按钮：最后一个非图片相关的 button
    const buttons = Array.from(container.querySelectorAll("button"));
    const lastBtn = buttons[buttons.length - 1];
    fireEvent.click(lastBtn);
    await waitFor(() => {
      expect(container.querySelector(".bg-red-50")).toBeTruthy();
    });
  });

  test("UI-REG-008 — 手机号格式错误时提示", async () => {
    const { container } = renderRegister();
    fillForm(container, { "姓名": "张三" });
    const phoneInput = container.querySelector('input[placeholder="电话"]') as HTMLInputElement;
    if (phoneInput) fireEvent.change(phoneInput, { target: { value: "123" } });
    const buttons = Array.from(container.querySelectorAll("button"));
    fireEvent.click(buttons[buttons.length - 1]);
    await waitFor(() => {
      expect(container.querySelector(".bg-red-50")).toBeTruthy();
    });
  });

  test("UI-REG-009 — 不上传图片时提示错误", async () => {
    const { container } = renderRegister();
    fillForm(container, { "姓名": "张三", "地址": "上海", "电话": "13800138000", "税号": "91310001" });
    const buttons = Array.from(container.querySelectorAll("button"));
    fireEvent.click(buttons[buttons.length - 1]);
    await waitFor(() => {
      expect(container.querySelector(".bg-red-50")).toBeTruthy();
    });
  });

  test("UI-REG-010 — 报名成功显示成功提示", async () => {
    mockPost.mockResolvedValueOnce({ data: { message: "报名成功" } });
    const { container } = renderRegister();
    fillForm(container, { "姓名": "张三", "地址": "上海", "电话": "13800138000", "税号": "91310001" });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });
    const buttons = Array.from(container.querySelectorAll("button"));
    fireEvent.click(buttons[buttons.length - 1]);
    await waitFor(() => {
      expect(container.querySelector(".bg-green-50")).toBeTruthy();
    });
  });

  test("UI-REG-011 — 重复报名显示错误提示", async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: { detail: "该税号或电话号码已报名" }, status: 409 },
    });
    const { container } = renderRegister();
    fillForm(container, { "姓名": "张三", "地址": "上海", "电话": "13800138000", "税号": "91310001" });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });
    const buttons = Array.from(container.querySelectorAll("button"));
    fireEvent.click(buttons[buttons.length - 1]);
    await waitFor(() => {
      expect(container.querySelector(".bg-red-50")).toBeTruthy();
    });
  });

  test("UI-REG-012 — 报名通道关闭显示错误提示", async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: { detail: "报名通道已关闭" }, status: 503 },
    });
    const { container } = renderRegister();
    fillForm(container, { "姓名": "张三", "地址": "上海", "电话": "13800138000", "税号": "91310001" });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });
    const buttons = Array.from(container.querySelectorAll("button"));
    fireEvent.click(buttons[buttons.length - 1]);
    await waitFor(() => {
      expect(container.querySelector(".bg-red-50")).toBeTruthy();
    });
  });

  test("UI-REG-013 — 提交中按钮显示加载状态", async () => {
    mockPost.mockImplementation(() => new Promise(() => {}));
    const { container } = renderRegister();
    fillForm(container, { "姓名": "张三", "地址": "上海", "电话": "13800138000", "税号": "91310001" });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });
    const buttons = Array.from(container.querySelectorAll("button"));
    fireEvent.click(buttons[buttons.length - 1]);
    await waitFor(() => {
      // 按钮文本变为"提交中..."（i18n key: register.submitting）
      expect(container.textContent).toContain("提交中");
    });
  });
});
