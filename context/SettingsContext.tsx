"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AdminSettings } from "@/types/admin";
import { useTranslation } from "./LanguageContext";

interface SettingsContextValue {
  settings: AdminSettings | null;
  loaded: boolean;
  // Admin text overrides apply only for the English locale; other locales keep
  // their translations. Falls back to the built-in value when unset.
  tx: (adminValue: string | undefined | null, builtin: string) => string;
  cvUrl: string;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: null,
  loaded: false,
  tx: (_admin, builtin) => builtin,
  cvUrl: "/resume.pdf",
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { locale } = useTranslation();

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const tx = (adminValue: string | undefined | null, builtin: string) =>
    locale === "en" && adminValue && adminValue.trim() ? adminValue : builtin;

  const cvUrl = settings?.cv?.url || "/resume.pdf";

  return (
    <SettingsContext.Provider value={{ settings, loaded, tx, cvUrl }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
