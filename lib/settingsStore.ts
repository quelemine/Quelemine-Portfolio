import type { AdminSettings } from "@/types/admin";
import { getStorage } from "./storage";

// Single source of truth for default settings — real defaults, not blanks.
export const DEFAULT_SETTINGS: AdminSettings = {
  profile: {
    name: "Isaac L.",
    title: "Quelemine",
    subtitle: "Junior Software Engineer · Full Stack Developer",
    description: "Building modern web applications and software solutions.",
    location: "Kigali, Rwanda",
    availableForWork: true,
    profileImage: "/images/profile/isaac-profile.jpg"
  },
  logo: { url: "" },
  loginLogo: { url: "" },
  cv: { url: "", filename: "", uploadDate: "" },
  projects: [],
  education: [],
  colors: {
    primary: "#2563eb",
    secondary: "#0B1F3A",
    accent: "#3b82f6",
    background: "#ffffff",
    text: "#1e293b",
    cardBackground: "#ffffff"
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    fontSize: { base: "16px", h1: "48px", h2: "36px", h3: "24px", small: "14px" },
    lineHeight: { normal: "1.5", relaxed: "1.75" },
    textAlign: "left",
    fontWeight: { normal: "400", medium: "500", bold: "700" }
  },
  siteContent: {
    hero: {
      badge: "Liberian Developer · Kigali, Rwanda",
      title: "Isaac L.",
      titleAccent: "Quelemine",
      subtitle: "Junior Software Engineer · Full Stack Developer",
      description: "Building modern web applications and software solutions.",
      viewProjects: "View Projects",
      downloadCV: "Download CV",
      contactMe: "Contact Me",
      availableForWork: "Available for Work"
    },
    about: {
      sectionLabel: "Who I Am",
      sectionTitle: "About Me",
      bio1: "I am a software engineer.",
      bio2: "My engineering journey spans multiple countries.",
      bio3: "I specialize in full-stack development.",
      bio4: "My goal is to grow as a software engineer.",
      tags: ["Full Stack Development", "Software Engineering"],
      getInTouch: "Get In Touch",
      downloadCV: "Download CV",
      image: "",
      highlights: {
        international: { label: "International Background", desc: "Liberia · Northern Cyprus · Rwanda" },
        education: { label: "Multi-Institution Student", desc: "UNILAK · BYU Pathway · Rauf Denktas" },
        stack: { label: "Full Stack Developer", desc: "React · Java · Spring Boot · PHP · MySQL" },
        location: { label: "Currently Based In", desc: "Kigali, Rwanda" }
      }
    },
    contact: {
      email: "contact@quelemine.com",
      phone: "",
      address: "Kigali, Rwanda"
    },
    social: {
      github: "https://github.com/quelemine",
      linkedin: "",
      twitter: ""
    }
  }
};

export function isObject(item: unknown): item is Record<string, unknown> {
  return !!item && typeof item === "object" && !Array.isArray(item);
}

export function deepMerge(target: any, source: any): any {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}

// Stored values are merged over the defaults so missing keys never come back blank.
export async function readSettings(): Promise<AdminSettings> {
  const storage = getStorage();
  const stored = await storage.readSettings();
  if (!stored) {
    return structuredClone(DEFAULT_SETTINGS);
  }
  return deepMerge(structuredClone(DEFAULT_SETTINGS), stored) as AdminSettings;
}

export async function writeSettings(settings: AdminSettings): Promise<void> {
  await getStorage().writeSettings(settings as unknown as Record<string, unknown>);
}
