import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { IMAGES, PROFILE_ALT } from "@/lib/images";
import { LanguageProvider } from "@/context/LanguageContext";
import { ChatProvider } from "@/context/ChatContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const BASE_URL = "https://queleminetech.info";

export const metadata: Metadata = {
  title: "Isaac L. Quelemine | Junior Software Engineer | Full Stack Developer",
  description:
    "Liberian Junior Software Engineer based in Rwanda. Full Stack Developer specializing in React.js, Java, Spring Boot, PHP, and modern web technologies.",
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
        <LanguageProvider><ChatProvider>{children}</ChatProvider></LanguageProvider>
      </body>
    </html>
  );
}
