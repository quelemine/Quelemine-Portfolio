"use client";
import { useEffect } from "react";

interface TypographyProviderProps {
  children: React.ReactNode;
}

export default function TypographyProvider({ children }: TypographyProviderProps) {
  useEffect(() => {
    // Fetch typography settings from admin settings
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.typography) {
          const root = document.documentElement;
          const { typography } = data;
          
          // Apply typography settings as CSS variables
          if (typography.fontFamily) {
            root.style.setProperty('--font-family', typography.fontFamily);
          }
          if (typography.fontSize?.base) {
            root.style.setProperty('--font-size-base', typography.fontSize.base);
          }
          if (typography.fontSize?.h1) {
            root.style.setProperty('--font-size-h1', typography.fontSize.h1);
          }
          if (typography.fontSize?.h2) {
            root.style.setProperty('--font-size-h2', typography.fontSize.h2);
          }
          if (typography.fontSize?.h3) {
            root.style.setProperty('--font-size-h3', typography.fontSize.h3);
          }
          if (typography.fontSize?.small) {
            root.style.setProperty('--font-size-small', typography.fontSize.small);
          }
          if (typography.lineHeight?.normal) {
            root.style.setProperty('--line-height-normal', typography.lineHeight.normal);
          }
          if (typography.lineHeight?.relaxed) {
            root.style.setProperty('--line-height-relaxed', typography.lineHeight.relaxed);
          }
          if (typography.textAlign) {
            root.style.setProperty('--text-align', typography.textAlign);
          }
          if (typography.fontWeight?.normal) {
            root.style.setProperty('--font-weight-normal', typography.fontWeight.normal);
          }
          if (typography.fontWeight?.medium) {
            root.style.setProperty('--font-weight-medium', typography.fontWeight.medium);
          }
          if (typography.fontWeight?.bold) {
            root.style.setProperty('--font-weight-bold', typography.fontWeight.bold);
          }
        }
      })
      .catch(err => console.error('Failed to fetch typography settings:', err));
  }, []);

  return <>{children}</>;
}
