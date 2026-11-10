"use client";
import { useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";

interface TypographyProviderProps {
  children: React.ReactNode;
}

export default function TypographyProvider({ children }: TypographyProviderProps) {
  const { settings } = useSettings();

  useEffect(() => {
    const typography = settings?.typography;
    if (!typography) return;

    const root = document.documentElement;
    const apply = (name: string, value?: string) => {
      if (value) root.style.setProperty(name, value);
    };

    apply("--font-family", typography.fontFamily);
    apply("--font-size-base", typography.fontSize?.base);
    apply("--font-size-h1", typography.fontSize?.h1);
    apply("--font-size-h2", typography.fontSize?.h2);
    apply("--font-size-h3", typography.fontSize?.h3);
    apply("--font-size-small", typography.fontSize?.small);
    apply("--line-height-normal", typography.lineHeight?.normal);
    apply("--line-height-relaxed", typography.lineHeight?.relaxed);
    apply("--text-align", typography.textAlign);
    apply("--font-weight-normal", typography.fontWeight?.normal);
    apply("--font-weight-medium", typography.fontWeight?.medium);
    apply("--font-weight-bold", typography.fontWeight?.bold);
  }, [settings]);

  return <>{children}</>;
}
