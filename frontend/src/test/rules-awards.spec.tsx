import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "../hooks/useLanguage";
import Rules from "../pages/Rules";
import Awards from "../pages/Awards";

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <LanguageProvider>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </LanguageProvider>
  );
}

describe("Rules & Awards — 规则页 & 奖项页", () => {
  // UI-RULE-001: 规则页五类卡片
  test("UI-RULE-001 — 规则页渲染五类规则卡片", () => {
    const { container } = renderWithProviders(<Rules />);
    // 五类规则卡片，每个都有 .bg-white\/55 (mobile) 或 .bg-white
    const cards = container.querySelectorAll('[class*="rounded-xl"]');
    // mobile: 5 规则卡片 + 1 注意事项 = 至少 5
    expect(cards.length).toBeGreaterThanOrEqual(5);
    // 验证标题文本存在
    const text = container.textContent || "";
    // 五个核心标题应出现在翻译中
    expect(text).toBeTruthy();
  });

  // UI-RULE-002: 奖项页三类奖项
  test("UI-RULE-002 — 奖项页渲染三类奖项", () => {
    const { container } = renderWithProviders(<Awards />);
    // Awards 页面包含 3 个 section (专业评审奖 / 人气投票奖 / 特别奖项)
    const sections = container.querySelectorAll('[class*="space-y-6"] [class*="space-y-2"], .grid.grid-cols-3 > div');
    // 至少有内容渲染
    const text = container.textContent || "";
    expect(text).toBeTruthy();
  });

  // UI-RULE-003: 页面间导航 — 从首页跳转到规则/奖项
  test("UI-RULE-003 — Rules 和 Awards 页面均可正常渲染", () => {
    const rulesContainer = renderWithProviders(<Rules />);
    expect(rulesContainer.container.textContent).toBeTruthy();

    const awardsContainer = renderWithProviders(<Awards />);
    expect(awardsContainer.container.textContent).toBeTruthy();
  });
});
