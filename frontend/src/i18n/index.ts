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

const translations: Record<Language, Translations> = {
  zh, en, es, pt, it, pl, fr,
};

export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations.zh;
}

export type { Translations };
