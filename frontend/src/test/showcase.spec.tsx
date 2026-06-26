import { describe, expect, test, vi, afterEach, beforeEach } from "vitest";
import { render, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "../hooks/useLanguage";

vi.mock("../api/client", () => ({ default: { get: vi.fn() } }));
import api from "../api/client";
import Showcase from "../pages/Showcase";

const mockGet = api.get as ReturnType<typeof vi.fn>;

function renderShowcase() {
  return render(
    <LanguageProvider>
      <MemoryRouter><Showcase /></MemoryRouter>
    </LanguageProvider>
  );
}

beforeEach(() => {
  mockGet.mockReset();
});

afterEach(() => cleanup());

describe("Showcase — 作品展示页", () => {
  test("UI-SHOW-001 — 作品卡片渲染（编号+脱敏姓名+图片+票数）", async () => {
    mockGet.mockResolvedValueOnce({
      data: { data: [{ id: "1", work_number: "ZH26-001", name_masked: "张**", images: ["/img.jpg"], vote_count: 100 }], total: 1 },
    });
    const { container } = renderShowcase();
    await waitFor(() => {
      expect(container.textContent).toContain("ZH26-001");
      expect(container.textContent).toContain("张**");
      expect(container.textContent).toContain("100");
    });
  });

  test("UI-SHOW-002 — 搜索功能", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [], total: 0 } });
    const { container } = renderShowcase();
    const searchInput = container.querySelector('input[placeholder*="搜索"]') as HTMLInputElement;
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: "ZH26-001" } });
      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith("/api/works", expect.objectContaining({ params: expect.objectContaining({ search: "ZH26-001" }) }));
      });
    }
  });

  test("UI-SHOW-003 — 排序切换", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [], total: 0 } });
    const { container } = renderShowcase();
    const select = container.querySelector("select");
    if (select) {
      fireEvent.change(select, { target: { value: "votes" } });
      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith("/api/works", expect.objectContaining({ params: expect.objectContaining({ sort: "votes" }) }));
      });
    }
  });

  test("UI-SHOW-004 — 分页导航", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: Array(8), total: 20 } });
    const { container } = renderShowcase();
    await waitFor(() => {
      expect(container.textContent).toContain("1 / 3");
    });
  });

  test("UI-SHOW-005 — 空状态", async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [], total: 0 } });
    const { container } = renderShowcase();
    await waitFor(() => {
      expect(container.textContent).toContain("暂无作品");
    });
  });

  test("UI-SHOW-006 — 加载状态", () => {
    mockGet.mockImplementation(() => new Promise(() => {}));
    const { container } = renderShowcase();
    expect(container.textContent).toContain("加载中");
  });

  test("UI-SHOW-007 — 姓名脱敏", async () => {
    mockGet.mockResolvedValueOnce({
      data: { data: [{ id: "1", work_number: "ZH26-001", name_masked: "张**", images: [], vote_count: 0 }], total: 1 },
    });
    const { container } = renderShowcase();
    await waitFor(() => {
      expect(container.textContent).toContain("张**");
    });
  });
});
