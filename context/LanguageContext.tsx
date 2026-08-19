"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import en, { type Translations } from "@/locales/en";
import fr from "@/locales/fr";
import es from "@/locales/es";
import pt from "@/locales/pt";
import ar from "@/locales/ar";
import zh from "@/locales/zh";

export type LocaleCode = "en" | "fr" | "es" | "pt" | "ar" | "zh";

export const LANGUAGES: { code: LocaleCode; label: string; flag: string; dir?: "rtl" }[] = [
  { code: "en", label: "English",    flag: "🇺🇸" },
  { code: "fr", label: "Français",   flag: "🇫🇷" },
  { code: "es", label: "Español",    flag: "🇪🇸" },
  { code: "pt", label: "Português",  flag: "🇧🇷" },
  { code: "ar", label: "العربية",    flag: "🇸🇦", dir: "rtl" },
  { code: "zh", label: "中文",        flag: "🇨🇳" },
];

const localeMap: Record<LocaleCode, Translations> = { en, fr, es, pt, ar, zh };

interface LanguageContextValue {
  locale: LocaleCode;
  t: Translations;
  setLocale: (code: LocaleCode) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  t: en,
  setLocale: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>("en");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as LocaleCode | null;
    if (saved && localeMap[saved]) setLocaleState(saved);
  }, []);

  const setLocale = (code: LocaleCode) => {
    setLocaleState(code);
    localStorage.setItem("locale", code);
    const dir = LANGUAGES.find((l) => l.code === code)?.dir ?? "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", code);
  };

  return (
    <LanguageContext.Provider value={{ locale, t: localeMap[locale], setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);
