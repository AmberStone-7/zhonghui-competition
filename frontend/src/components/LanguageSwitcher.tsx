import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import type { Language } from "../i18n";

export default function LanguageSwitcher() {
  const { language, setLanguage, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = languages.find((l) => l.code === language);

  return (
    <div ref={ref} className="relative" data-testid="language-switcher">
      <button
        type="button"
        aria-label={current?.nativeLabel}
        data-testid="lang-trigger"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-[#667085] hover:text-[#111827] hover:bg-gray-50 transition-all"
      >
        <Globe className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">{current?.nativeLabel}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-[100]"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={language === lang.code}
              onClick={() => {
                setLanguage(lang.code as Language);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                language === lang.code
                  ? "bg-brand-pink text-brand-red-light font-semibold"
                  : "text-[#667085] hover:bg-gray-50 hover:text-[#111827]"
              }`}
            >
              {lang.nativeLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
