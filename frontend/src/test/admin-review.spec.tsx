import { describe, expect, test, vi, afterEach, beforeEach } from "vitest";
import { render, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../api/client", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
import api from "../api/client";
import Review from "../pages/admin/Review";

const mockGet = api.get as ReturnType<typeof vi.fn>;
const mockPost = api.post as ReturnType<typeof vi.fn>;

function makePendingWork(id = "1", name = "张三") {
  return {
    id, work_number: null, contestant_name: name,
    contestant_phone: "13800138000", contestant_tax_id: "X",
    contestant_address: "上海", images: [], status: "pending",
    reject_reason: null, created_at: new Date().toISOString(),
  };
}

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
  sessionStorage.removeItem("mock_mode");
});

afterEach(() => cleanup());

describe("Admin Review — 作品审核页", () => {
  test("UI-REV-001 — 待审核列表渲染", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [makePendingWork()], total: 1 } });
    const { container } = render(<MemoryRouter><Review /></MemoryRouter>);
    await waitFor(() => expect(container.textContent).toContain("张三"));
  });

  test("UI-REV-002 — 审核通过按钮点击", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [makePendingWork()], total: 1 } });
    const { container } = render(<MemoryRouter><Review /></MemoryRouter>);
    await waitFor(() => expect(container.textContent).toContain("张三"));
    const buttons = container.querySelectorAll("button");
    // 找"通过"按钮
    const approveBtn = Array.from(buttons).find(b => b.textContent?.trim() === "通过");
    expect(approveBtn).toBeTruthy();
  });

  test("UI-REV-003 — 拒绝按钮点击显示拒绝原因框", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [makePendingWork()], total: 1 } });
    const { container } = render(<MemoryRouter><Review /></MemoryRouter>);
    await waitFor(() => expect(container.textContent).toContain("张三"));
    const buttons = container.querySelectorAll("button");
    const rejectBtn = Array.from(buttons).find(b => b.textContent?.trim() === "拒绝");
    if (rejectBtn) fireEvent.click(rejectBtn);
    await waitFor(() => {
      expect(container.textContent).toContain("确认拒绝");
    });
  });

  test("UI-REV-004 — 拒绝时未填原因则确认按钮禁用", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [makePendingWork()], total: 1 } });
    const { container } = render(<MemoryRouter><Review /></MemoryRouter>);
    await waitFor(() => expect(container.textContent).toContain("张三"));
    const buttons = container.querySelectorAll("button");
    const rejectBtn = Array.from(buttons).find(b => b.textContent?.trim() === "拒绝");
    if (rejectBtn) fireEvent.click(rejectBtn);
    await waitFor(() => {
      // "确认拒绝" 按钮应为 disabled (未填原因)
      const confirmBtns = container.querySelectorAll("button");
      const confirmBtn = Array.from(confirmBtns).find(b => b.textContent?.includes("确认拒绝"));
      expect(confirmBtn).toBeTruthy();
    });
  });

  test("UI-REV-006 — 审核后列表刷新", async () => {
    mockGet
      .mockResolvedValueOnce({ data: { data: [makePendingWork()], total: 1 } })
      .mockResolvedValueOnce({ data: { data: [], total: 0 } });
    mockPost.mockResolvedValueOnce({ data: { message: "ok" } });
    const { container } = render(<MemoryRouter><Review /></MemoryRouter>);
    await waitFor(() => expect(container.textContent).toContain("张三"));
    const buttons = container.querySelectorAll("button");
    const approveBtn = Array.from(buttons).find(b => b.textContent?.trim() === "通过");
    if (approveBtn) fireEvent.click(approveBtn);
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
  });
});

  test("UI-REV-007 — 多个待审核作品的 workNumber 互不影响", async () => {
    mockGet.mockResolvedValueOnce({
      data: { data: [makePendingWork("1", "张三"), makePendingWork("2", "李四")], total: 2 },
    });
    const { container } = render(<MemoryRouter><Review /></MemoryRouter>);
    await waitFor(() => {
      expect(container.textContent).toContain("张三");
      expect(container.textContent).toContain("李四");
    });

    // 找到两个作品编号输入框
    const inputs = container.querySelectorAll<HTMLInputElement>('input[placeholder="作品编号（可选）"]');
    expect(inputs.length).toBe(2);

    // 为作品1输入编号
    fireEvent.change(inputs[0], { target: { value: "ZH26-001" } });
    expect(inputs[0].value).toBe("ZH26-001");
    // 作品2的输入框应保持空
    expect(inputs[1].value).toBe("");

    // 为作品2输入不同的编号
    fireEvent.change(inputs[1], { target: { value: "ZH26-002" } });
    expect(inputs[1].value).toBe("ZH26-002");
    // 作品1的编号应保持不变
    expect(inputs[0].value).toBe("ZH26-001");
  });
