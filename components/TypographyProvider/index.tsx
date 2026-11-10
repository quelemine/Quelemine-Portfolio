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

    // Apply admin color theme to the global CSS tokens
    const colors = settings?.colors;
    if (colors) {
      const hexToRgba = (hex: string, alpha: number) => {
        const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
        if (!m) return null;
        const n = parseInt(m[1], 16);
        return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
      };
      const accent = colors.accent || colors.primary;
      const accentDim = hexToRgba(accent, 0.10);
      const accentGlow = hexToRgba(accent, 0.20);
      const borderHover = hexToRgba(accent, 0.30);
      apply("--accent", accent);
      apply("--accent-hover", colors.primary || accent);
      if (accentDim) apply("--accent-dim", accentDim);
      if (accentGlow) apply("--accent-glow", accentGlow);
      apply("--navy", colors.secondary);
      apply("--bg-body", colors.background);
      apply("--bg-card", colors.cardBackground);
      apply("--bg-section-alt", colors.background);
      apply("--text-primary", colors.text);
      apply("--text-secondary", colors.mutedText || colors.text);
      apply("--text-muted", colors.mutedText || colors.text);
      apply("--border", colors.borderColor || "#E2E8F0");
      if (borderHover) apply("--border-hover", borderHover);
    }
  }, [settings]);

  return <>{children}</>;
}
