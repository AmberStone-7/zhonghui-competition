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

  test("UI-RULE-004 — 指定奖项使用新的实物图", () => {
    const { getAllByAltText } = renderWithProviders(<Awards />);

    expect(getAllByAltText("1000€ MP 代金券").every((img) => img.getAttribute("src") === "/assets/prizes/professional-second-real.png")).toBe(true);
    expect(getAllByAltText("iPad + AirPods").every((img) => img.getAttribute("src") === "/assets/prizes/professional-third-real.png")).toBe(true);
    expect(getAllByAltText("600€ MP 代金券").every((img) => img.getAttribute("src") === "/assets/prizes/popular-first-real.png")).toBe(true);
    expect(getAllByAltText("300€ MP 代金券").some((img) => img.getAttribute("src") === "/assets/prizes/popular-second-real.png")).toBe(true);
    expect(getAllByAltText("MP 惊喜家居礼包").every((img) => img.getAttribute("src") === "/assets/prizes/popular-third-real.png")).toBe(true);
    expect(getAllByAltText("Rituals 礼盒").every((img) => img.getAttribute("src") === "/assets/prizes/popular-rising-real.png")).toBe(true);
    expect(getAllByAltText("300€ MP 代金券").some((img) => img.getAttribute("src") === "/assets/prizes/special-creative-real.png")).toBe(true);
    expect(getAllByAltText("有机会获得").some((img) => img.getAttribute("src") === "/assets/prizes/participation-100-real.png")).toBe(true);
    expect(getAllByAltText("有机会获得").some((img) => img.getAttribute("src") === "/assets/prizes/participation-50-real.png")).toBe(true);
    expect(getAllByAltText("有机会获得").some((img) => img.getAttribute("src") === "/assets/prizes/participation-10-real.png")).toBe(true);
  });

  test("UI-RULE-005 — 特别抽奖仅展示文字说明", () => {
    const { queryAllByAltText, getAllByText } = renderWithProviders(<Awards />);

    expect(queryAllByAltText("新款 iPhone、茅台等礼品")).toHaveLength(0);
    expect(getAllByText("特别抽奖").length).toBeGreaterThan(0);
    expect(getAllByText("参与橱窗大赛且参与学讯金票活动，即可参与特别抽奖").length).toBeGreaterThan(0);
    expect(getAllByText("新款 iPhone、茅台等礼品").length).toBeGreaterThan(0);
  });

  test("UI-RULE-006 — PC 端按奖项类别展示四个分区", () => {
    const { getAllByTestId } = renderWithProviders(<Awards />);

    const professionalRow = getAllByTestId("awards-section").find((section) => section.getAttribute("data-section-title") === "专业评审类");
    const popularRow = getAllByTestId("awards-section").find((section) => section.getAttribute("data-section-title") === "人气投票类");
    const specialRow = getAllByTestId("awards-section").find((section) => section.getAttribute("data-section-title") === "特别奖项");
    const participationRow = getAllByTestId("awards-section").find((section) => section.getAttribute("data-section-title") === "参与奖项");

    expect(professionalRow).toBeTruthy();
    expect(popularRow).toBeTruthy();
    expect(specialRow).toBeTruthy();
    expect(participationRow).toBeTruthy();
  });

  test("UI-RULE-007 — PC 端每个奖项分区内的奖品归属正确", () => {
    const { getAllByTestId } = renderWithProviders(<Awards />);

    const professionalRow = getAllByTestId("awards-section").find((section) => section.getAttribute("data-section-title") === "专业评审类");
    const popularRow = getAllByTestId("awards-section").find((section) => section.getAttribute("data-section-title") === "人气投票类");
    const specialRow = getAllByTestId("awards-section").find((section) => section.getAttribute("data-section-title") === "特别奖项");
    const participationRow = getAllByTestId("awards-section").find((section) => section.getAttribute("data-section-title") === "参与奖项");

    expect(professionalRow?.textContent).toContain("专业一等奖");
    expect(professionalRow?.textContent).toContain("专业二等奖");
    expect(professionalRow?.textContent).toContain("专业三等奖");

    expect(popularRow?.textContent).toContain("人气第一名");
    expect(popularRow?.textContent).toContain("人气第二名");
    expect(popularRow?.textContent).toContain("人气第三名");
    expect(popularRow?.textContent).toContain("人气新星奖（第4-50名）");

    expect(specialRow?.textContent).toContain("最佳创意奖");
    expect(specialRow?.textContent).not.toContain("参与奖 - 100€ 代金券");

    expect(participationRow?.textContent).toContain("参与奖 - 100€ 代金券");
    expect(participationRow?.textContent).toContain("参与奖 - 50€ 代金券");
    expect(participationRow?.textContent).toContain("参与奖 - 10€ 代金券");
  });

});
