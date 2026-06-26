import { describe, expect, test, vi, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "../hooks/useLanguage";

vi.mock("../api/client", () => ({ default: { get: vi.fn() } }));
import api from "../api/client";
import Showcase from "../pages/Showcase";
import Vote from "../pages/Vote";

const mockGet = api.get as ReturnType<typeof vi.fn>;

afterEach(() => cleanup());

describe("Mock Fallback — API 降级", () => {
  test("UI-MOCK-001 — Showcase API 不可用时降级到 mock 数据", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network Error"));
    const { container } = render(
      <LanguageProvider><MemoryRouter><Showcase /></MemoryRouter></LanguageProvider>
    );
    await waitFor(() => {
      expect(container.textContent).toContain("演示数据");
    });
  });

  test("UI-MOCK-002 — Vote API 不可用时降级到 mock 数据", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network Error"));
    const { container } = render(
      <LanguageProvider><MemoryRouter><Vote /></MemoryRouter></LanguageProvider>
    );
    await waitFor(() => {
      expect(container.textContent).toContain("演示数据");
    });
  });

  test("UI-MOCK-003 — 降级后仍显示作品", async () => {
    mockGet.mockRejectedValueOnce(new Error("Network Error"));
    const { container } = render(
      <LanguageProvider><MemoryRouter><Showcase /></MemoryRouter></LanguageProvider>
    );
    await waitFor(() => {
      // 降级数据含代金券信息或编号
      expect(container.textContent).toContain("ZH26");
    });
  });
});
