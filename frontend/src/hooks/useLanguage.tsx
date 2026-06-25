import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import type { Language, Translations } from "../i18n";
import { getTranslations, LANGUAGES } from "../i18n";

const STORAGE_KEY = "app_language";

function detectLanguage(): Language {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && LANGUAGES.some((l) => l.code === stored)) {
      return stored as Language;
    }
  } catch { /* ignore */ }
  return "zh";
}

interface LanguageContextValue {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  languages: typeof LANGUAGES;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      sessionStorage.setItem(STORAGE_KEY, lang);
    } catch { /* ignore */ }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      t: getTranslations(language),
      setLanguage,
      languages: LANGUAGES,
    }),
    [language, setLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
