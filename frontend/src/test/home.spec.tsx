import { describe, expect, test, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "../hooks/useLanguage";
import Home from "../pages/Home";

function renderWithProviders(ui: React.ReactElement, { route = "/" } = {}) {
  return render(
    <LanguageProvider>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </LanguageProvider>
  );
}

describe("Home — 首页入口与导航", () => {
  beforeEach(() => {
    sessionStorage.setItem("data_authorized", "1");
    document.body.innerHTML = "";
  });

  // UI-HOME-002: 手机端按钮入口
  test("UI-HOME-002 — 手机端按钮入口", () => {
    const { container } = renderWithProviders(<Home />);
    const mobileRoot = container.querySelector(".md\\:hidden");
    expect(mobileRoot).not.toBeNull();

    const text = mobileRoot!.textContent!;
    expect(text).toContain("报名上传");
    expect(text).toContain("人气投票");
    expect(text).toContain("作品展示");
    expect(text).toContain("赛事规则");
    expect(text).toContain("赛事奖项");
  });

  // UI-HOME-003: PC 端三列卡片入口
  test("UI-HOME-003 — PC 端三列卡片入口", () => {
    const { container } = renderWithProviders(<Home />);
    const pcRoot = container.querySelector(".hidden.md\\:block");
    expect(pcRoot).not.toBeNull();

    const text = pcRoot!.textContent!;
    expect(text).toContain("报名参赛");
    expect(text).toContain("作品展示");
    expect(text).toContain("人气投票");
  });

  // UI-HOME-004: 点击报名按钮跳转 → /register
  test("UI-HOME-004 — 报名按钮链接到 /register", () => {
    renderWithProviders(<Home />);
    const link = screen.getByRole("link", { name: "报名上传" });
    expect(link.getAttribute("href")).toBe("/register");
  });

  // UI-HOME-005: 点击作品展示按钮跳转 → /showcase
  test("UI-HOME-005 — 作品展示按钮链接到 /showcase", () => {
    renderWithProviders(<Home />);
    // 手机和 PC 都有"作品展示"，任取其一验证
    const links = screen.getAllByRole("link", { name: "作品展示" });
    expect(links[0].getAttribute("href")).toBe("/showcase");
  });

  // UI-HOME-006: 点击人气投票按钮跳转 → /vote
  test("UI-HOME-006 — 人气投票按钮链接到 /vote", () => {
    renderWithProviders(<Home />);
    const link = screen.getByRole("link", { name: "人气投票" });
    expect(link.getAttribute("href")).toBe("/vote");
  });
});
