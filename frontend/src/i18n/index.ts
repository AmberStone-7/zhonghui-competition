import zh from "./zh";
import en from "./en";
import es from "./es";
import pt from "./pt";
import it from "./it";
import pl from "./pl";
import fr from "./fr";
import type { Translations } from "./zh";

export type Language = "zh" | "en" | "es" | "pt" | "it" | "pl" | "fr";

export const LANGUAGES: { code: Language; nativeLabel: string }[] = [
  { code: "zh", nativeLabel: "中文" },
  { code: "en", nativeLabel: "English" },
  { code: "es", nativeLabel: "Español" },
  { code: "pt", nativeLabel: "Português" },
  { code: "it", nativeLabel: "Italiano" },
  { code: "pl", nativeLabel: "Polski" },
  { code: "fr", nativeLabel: "Français" },
];

// Merge non-zh translations with zh as fallback for missing keys
const merged: Record<Language, Translations> = {
  zh,
  en: { ...zh, ...en } as Translations,
  es: { ...zh, ...es } as Translations,
  pt: { ...zh, ...pt } as Translations,
  it: { ...zh, ...it } as Translations,
  pl: { ...zh, ...pl } as Translations,
  fr: { ...zh, ...fr } as Translations,
};

export function getTranslations(lang: Language): Translations {
  return merged[lang] || merged.zh;
}

export type { Translations };
