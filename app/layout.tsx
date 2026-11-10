import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { IMAGES, PROFILE_ALT } from "@/lib/images";
import { LanguageProvider } from "@/context/LanguageContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ChatProvider } from "@/context/ChatContext";
import TypographyProvider from "@/components/TypographyProvider";

const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [
    { path: "../public/fonts/inter-300.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/inter-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/inter-500.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/inter-600.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/inter-700.woff2", weight: "700", style: "normal" },
  ],
});

const manrope = localFont({
  variable: "--font-manrope",
  display: "swap",
  src: [
    { path: "../public/fonts/manrope-600.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/manrope-700.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/manrope-800.woff2", weight: "800", style: "normal" },
  ],
});

const BASE_URL = "https://quelemine.com";

export const metadata: Metadata = {
  title: "Isaac L. Quelemine | Junior Software Engineer | Full Stack Developer",
  description:
    "Liberian Junior Software Engineer based in Rwanda. Full Stack Developer specializing in React.js, Java, Spring Boot, PHP, and modern web technologies.",
  icons: {
    icon: [{ url: "/images/profile/isaac-profile.jpg", type: "image/jpeg" }],
    apple: [{ url: "/images/profile/isaac-profile.jpg", type: "image/jpeg" }],
  },
  keywords: [
    "Software Engineer Rwanda",
    "Full Stack Developer",
    "React Developer",
    "Java Developer",
    "Spring Boot Developer",
    "PHP Developer",
    "Software Engineering Student",
    "Isaac Quelemine",
    "Liberian Developer",
  ],
  authors: [{ name: "Isaac L. Quelemine", url: BASE_URL }],
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "Isaac L. Quelemine | Junior Software Engineer",
    description:
      "Full Stack Developer building modern web applications and software solutions. React.js · Java · Spring Boot · PHP · MySQL.",
    url: BASE_URL,
    siteName: "Isaac L. Quelemine Portfolio",
    type: "website",
    images: [
      {
        url: IMAGES.socialPreview,
        width: 500,
        height: 500,
        alt: PROFILE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Isaac L. Quelemine | Junior Software Engineer",
    description: "Full Stack Developer | React.js | Java | Spring Boot | PHP",
    images: [IMAGES.socialPreview],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${manrope.variable} antialiased`}>
        <LanguageProvider>
          <SettingsProvider>
            <TypographyProvider>
              <ChatProvider>{children}</ChatProvider>
            </TypographyProvider>
          </SettingsProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
