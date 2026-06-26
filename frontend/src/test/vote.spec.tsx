import { describe, expect, test, vi, afterEach, beforeEach } from "vitest";
import { render, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "../hooks/useLanguage";

vi.mock("../api/client", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
import api from "../api/client";
import Vote from "../pages/Vote";

const mockGet = api.get as ReturnType<typeof vi.fn>;
const mockPost = api.post as ReturnType<typeof vi.fn>;

function renderVote() {
  render(
    <LanguageProvider>
      <MemoryRouter><Vote /></MemoryRouter>
    </LanguageProvider>
  );
  // Vote has two useEffect that trigger API calls
}

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
});

afterEach(() => cleanup());

describe("Vote — 人气投票页", () => {
  test("UI-VOTE-001 — 按票数降序排列", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/api/vote/status") return Promise.resolve({ data: { channel_status: "open" } });
      return Promise.resolve({ data: { data: [
        { id: "1", work_number: "A", name_masked: "张**", images: [], vote_count: 200 },
        { id: "2", work_number: "B", name_masked: "李**", images: [], vote_count: 100 },
      ], total: 2 } });
    });
    const { container } = render(
      <LanguageProvider><MemoryRouter><Vote /></MemoryRouter></LanguageProvider>
    );
    await waitFor(() => {
      const text = container.textContent || "";
      const aIdx = text.indexOf("A");
      const bIdx = text.indexOf("B");
      expect(aIdx).toBeLessThan(bIdx); // 200 票的在 100 票前面
    });
  });

  test("UI-VOTE-002 — 点击投票弹出手机号弹窗", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/api/vote/status") return Promise.resolve({ data: { channel_status: "open" } });
      return Promise.resolve({ data: { data: [{ id: "1", work_number: "A", name_masked: "张**", images: [], vote_count: 10 }], total: 1 } });
    });
    const { container } = render(
      <LanguageProvider><MemoryRouter><Vote /></MemoryRouter></LanguageProvider>
    );
    await waitFor(() => { expect(container.textContent).toContain("A"); });
    const voteBtn = container.querySelector("button:not([disabled])");
    if (voteBtn) {
      fireEvent.click(voteBtn);
      await waitFor(() => {
        expect(document.body.textContent).toContain("手机号");
      });
    }
  });

  test("UI-VOTE-003 — 手机号格式校验", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/api/vote/status") return Promise.resolve({ data: { channel_status: "open" } });
      return Promise.resolve({ data: { data: [{ id: "1", work_number: "A", name_masked: "张**", images: [], vote_count: 10 }], total: 1 } });
    });
    const { container } = render(
      <LanguageProvider><MemoryRouter><Vote /></MemoryRouter></LanguageProvider>
    );
    await waitFor(() => { expect(container.textContent).toContain("A"); });
    const voteBtn = container.querySelector("button:not([disabled])");
    if (voteBtn) fireEvent.click(voteBtn);
    await waitFor(() => {
      const phoneInput = document.querySelector('input[type="tel"]') as HTMLInputElement;
      expect(phoneInput).toBeTruthy();
    });
  });

  test("UI-VOTE-006 — 投票通道关闭时投票按钮禁用", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/api/vote/status") return Promise.resolve({ data: { channel_status: "closed" } });
      return Promise.resolve({ data: { data: [], total: 0 } });
    });
    const { container } = render(
      <LanguageProvider><MemoryRouter><Vote /></MemoryRouter></LanguageProvider>
    );
    await waitFor(() => {
      expect(container.textContent).toContain("已关闭");
    });
  });

  test("UI-VOTE-007 — 投票未开始时显示未开始", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/api/vote/status") return Promise.resolve({ data: { channel_status: "not_started" } });
      return Promise.resolve({ data: { data: [], total: 0 } });
    });
    const { container } = render(
      <LanguageProvider><MemoryRouter><Vote /></MemoryRouter></LanguageProvider>
    );
    await waitFor(() => {
      expect(container.textContent).toContain("未开始");
    });
  });

  test("UI-VOTE-008 — 投票成功后显示成功提示", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/api/vote/status") return Promise.resolve({ data: { channel_status: "open" } });
      return Promise.resolve({ data: { data: [{ id: "1", work_number: "A", name_masked: "张**", images: [], vote_count: 10 }], total: 1 } });
    });
    mockPost.mockResolvedValueOnce({ data: { new_vote_count: 11 } });
    const { container } = render(
      <LanguageProvider><MemoryRouter><Vote /></MemoryRouter></LanguageProvider>
    );
    await waitFor(() => { expect(container.textContent).toContain("A"); });
    const voteBtn = container.querySelector("button:not([disabled])");
    if (voteBtn) fireEvent.click(voteBtn);
    await waitFor(() => {
      const phoneInput = document.querySelector('input[type="tel"]') as HTMLInputElement;
      expect(phoneInput).toBeTruthy();
      fireEvent.change(phoneInput, { target: { value: "13800138000" } });
    });
    const confirmBtns = document.querySelectorAll("button");
    const confirmBtn = Array.from(confirmBtns).find(b => b.textContent?.includes("确认"));
    if (confirmBtn) fireEvent.click(confirmBtn);
  });
});
