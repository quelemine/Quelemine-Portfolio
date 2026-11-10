import type { AdminSettings } from "@/types/admin";
import { getStorage } from "./storage";

// Single source of truth for default settings — real defaults, not blanks.
// Text defaults are "" meaning "use the built-in site text". The public site
// only applies an admin value when it is a non-empty string that is not one of
// the old placeholder defaults (see LEGACY_TEXT_DEFAULTS below).
export const DEFAULT_SETTINGS: AdminSettings = {
  profile: {
    name: "",
    title: "",
    subtitle: "",
    description: "",
    location: "",
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
      badge: "",
      title: "",
      titleAccent: "",
      subtitle: "",
      description: "",
      viewProjects: "",
      downloadCV: "",
      contactMe: "",
      availableForWork: ""
    },
    about: {
      sectionLabel: "",
      sectionTitle: "",
      bio1: "",
      bio2: "",
      bio3: "",
      bio4: "",
      tags: [],
      getInTouch: "",
      downloadCV: "",
      image: "",
      highlights: {
        international: { label: "", desc: "" },
        education: { label: "", desc: "" },
        stack: { label: "", desc: "" },
        location: { label: "", desc: "" }
      }
    },
    contact: {
      email: "",
      phone: "",
      address: ""
    },
    social: {
      github: "",
      linkedin: "",
      twitter: ""
    }
  }
};

// Strings that used to be the placeholder defaults. A stored value equal to one
// of these is treated as empty so it never overrides the real built-in text.
const LEGACY_TEXT_DEFAULTS = new Set<string>([
  "Isaac L.",
  "Quelemine",
  "Junior Software Engineer · Full Stack Developer",
  "Building modern web applications and software solutions.",
  "Kigali, Rwanda",
  "Liberian Developer · Kigali, Rwanda",
  "View Projects",
  "Download CV",
  "Contact Me",
  "Who I Am",
  "About Me",
  "I am a software engineer.",
  "My engineering journey spans multiple countries.",
  "I specialize in full-stack development.",
  "My goal is to grow as a software engineer.",
  "Full Stack Development",
  "Software Engineering",
  "Get In Touch",
  "International Background",
  "Liberia · Northern Cyprus · Rwanda",
  "Multi-Institution Student",
  "UNILAK · BYU Pathway · Rauf Denktas",
  "Full Stack Developer",
  "React · Java · Spring Boot · PHP · MySQL",
  "Currently Based In",
  "contact@quelemine.com",
  "https://github.com/quelemine",
]);

function sanitizeDeep(value: unknown): unknown {
  if (typeof value === "string") {
    return LEGACY_TEXT_DEFAULTS.has(value) ? "" : value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeDeep).filter((v) => v !== "");
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] = sanitizeDeep(v);
    }
    return out;
  }
  return value;
}

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
  return sanitizeDeep(deepMerge(structuredClone(DEFAULT_SETTINGS), stored)) as AdminSettings;
}

export async function writeSettings(settings: AdminSettings): Promise<void> {
  await getStorage().writeSettings(settings as unknown as Record<string, unknown>);
}
