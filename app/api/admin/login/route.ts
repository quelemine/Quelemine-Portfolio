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
    return {
      profile: {
        name: "",
        title: "",
        subtitle: "",
        description: "",
        location: "",
        availableForWork: true,
        profileImage: ""
      },
      logo: { url: "" },
      loginLogo: { url: "" },
      cv: { url: "", filename: "", uploadDate: "" },
      projects: [],
      education: [],
      colors: {
        primary: "", secondary: "", accent: "",
        background: "", text: "", cardBackground: ""
      },
      typography: {
        fontFamily: "",
        fontSize: { base: "", h1: "", h2: "", h3: "", small: "" },
        lineHeight: { normal: "", relaxed: "" },
        textAlign: "left",
        fontWeight: { normal: "", medium: "", bold: "" }
      },
      siteContent: {
        hero: {
          badge: "", title: "", titleAccent: "", subtitle: "",
          description: "", viewProjects: "", downloadCV: "",
          contactMe: "", availableForWork: ""
        },
        about: {
          sectionLabel: "", sectionTitle: "",
          bio1: "", bio2: "", bio3: "", bio4: "",
          tags: [], getInTouch: "", downloadCV: "", image: "",
          highlights: {
            international: { label: "", desc: "" },
            education: { label: "", desc: "" },
            stack: { label: "", desc: "" },
            location: { label: "", desc: "" }
          }
        },
        contact: { email: "", phone: "", address: "" },
        social: { github: "", linkedin: "", twitter: "" }
      },
      security: { username: "admin", password: "", securityQuestion: "", securityAnswer: "" }
    };
  }
}

// POST - Verify username and password
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const envPassword = process.env.ADMIN_PASSWORD || "";
    const settings = await readSettings();
    const storedUsername = settings.security.username || "admin";
    const storedPassword = settings.security.password || "";
    
    // Check username and password
    const isUsernameValid = username === storedUsername;
    const isPasswordValid = password === envPassword || password === storedPassword;
    
    if (isUsernameValid && isPasswordValid) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
