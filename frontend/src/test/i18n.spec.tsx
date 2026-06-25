import { describe, expect, test, beforeEach } from "vitest";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "../hooks/useLanguage";
import Layout from "../components/Layout";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { getTranslations } from "../i18n";
import type { Language } from "../i18n";

function renderWithProviders(ui: React.ReactElement, { initialRoute = "/" } = {}) {
  return render(
    <LanguageProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        {ui}
      </MemoryRouter>
    </LanguageProvider>
  );
}

function firstTrigger() {
  return screen.getAllByTestId("lang-trigger")[0];
}

describe("i18n translations", () => {
  test("all languages have the same set of translation keys", () => {
    const zh = getTranslations("zh");
    const zhKeys = Object.keys(zh).sort();
    const languages: Language[] = ["en", "es", "pt", "it", "pl", "fr"];
    for (const lang of languages) {
      const t = getTranslations(lang);
      const keys = Object.keys(t as Record<string, unknown>).sort();
      expect(keys).toEqual(zhKeys);
    }
  });

  test("zh translations match expected key count", () => {
    const zh = getTranslations("zh");
    expect(Object.keys(zh).length).toBeGreaterThanOrEqual(80);
  });

  test("en translations are different from zh for nav items", () => {
    const zh = getTranslations("zh");
    const en = getTranslations("en");
    expect(en["nav.register"]).toBe("Register");
    expect(en["nav.register"]).not.toBe(zh["nav.register"]);
  });

  test("getTranslations falls back to zh for invalid language", () => {
    const t = getTranslations("xx" as Language);
    expect(t["nav.register"]).toBe("报名上传");
  });
});

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test("renders with language trigger button", () => {
    renderWithProviders(<LanguageSwitcher />);
    const triggers = screen.getAllByTestId("lang-trigger");
    expect(triggers.length).toBeGreaterThanOrEqual(1);
    expect(triggers[0].textContent).toContain("中文");
  });

  test("opens dropdown on click and lists all 7 languages", async () => {
    renderWithProviders(<LanguageSwitcher />);
    fireEvent.click(firstTrigger());

    const dropdown = await waitFor(() => screen.getByRole("listbox"));
    const labels = ["中文", "English", "Español", "Português", "Italiano", "Polski", "Français"];
    for (const label of labels) {
      expect(within(dropdown).getByText(label)).toBeTruthy();
    }
  });
});

describe("Layout with translations", () => {
  test("language switcher is present in Layout header", () => {
    renderWithProviders(<Layout />, { initialRoute: "/register" });
    const switchers = screen.getAllByTestId("language-switcher");
    expect(switchers.length).toBeGreaterThanOrEqual(1);
  });

  test("nav items use Chinese labels by default", () => {
    renderWithProviders(<Layout />, { initialRoute: "/register" });
    const nav = document.querySelector("nav.pc-header-nav")!;
    expect(nav).toBeTruthy();
    expect(within(nav).getByText("报名上传")).toBeTruthy();
    expect(within(nav).getByText("作品展示")).toBeTruthy();
    expect(within(nav).getByText("赛制规则")).toBeTruthy();
  });
});
