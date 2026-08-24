import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { AdminSettings } from "@/types/admin";

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'adminSettings.json');

// Helper function to read settings
async function readSettings(): Promise<AdminSettings> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return default settings if file doesn't exist
    return {
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
      cv: {
        url: "",
        filename: "",
        uploadDate: ""
      },
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
        fontSize: {
          base: "16px",
          h1: "48px",
          h2: "36px",
          h3: "24px",
          small: "14px"
        },
        lineHeight: {
          normal: "1.5",
          relaxed: "1.75"
        },
        textAlign: "left",
        fontWeight: {
          normal: "400",
          medium: "500",
          bold: "700"
        }
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
          email: "contact@queleminetech.info",
          phone: "",
          address: "Kigali, Rwanda"
        },
        social: {
          github: "https://github.com/quelemine",
          linkedin: "",
          twitter: ""
        }
      },
      security: {
        username: "admin",
        password: "",
        securityQuestion: "",
        securityAnswer: ""
      }
    };
  }
}

// Helper function to write settings
async function writeSettings(settings: AdminSettings): Promise<void> {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

// GET - Fetch all settings (excluding password)
export async function GET() {
  try {
    const settings = await readSettings();
    // Don't send password to client
    const { security, ...safeSettings } = settings;
    return NextResponse.json(safeSettings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
  }
}

// PUT - Update settings
export async function PUT(request: Request) {
  try {
    const updates = await request.json();
    const currentSettings = await readSettings();
    
    // Deep merge updates with current settings
    const updatedSettings = deepMerge(currentSettings, updates);
    
    // Preserve security separately
    updatedSettings.security = currentSettings.security;
    
    await writeSettings(updatedSettings);
    
    // Return updated settings without password
    const { security, ...safeSettings } = updatedSettings;
    return NextResponse.json(safeSettings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

// Helper function for deep merging
function deepMerge(target: any, source: any): any {
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

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}