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

// Helper function to write settings
async function writeSettings(settings: AdminSettings): Promise<void> {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

// POST - Verify current password and set new password/username/security
export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword, newUsername, securityQuestion, securityAnswer } = await request.json();

    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
    }

    const settings = await readSettings();
    
    // Check if current password matches (check both env var and stored password)
    const envPassword = process.env.ADMIN_PASSWORD || "";
    const storedPassword = settings.security.password || "";
    
    const isValid = currentPassword === envPassword || currentPassword === storedPassword;
    
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Update password, username, and security settings
    if (newPassword) {
      settings.security.password = newPassword;
    }
    if (newUsername) {
      settings.security.username = newUsername;
    }
    if (securityQuestion !== undefined) {
      settings.security.securityQuestion = securityQuestion;
    }
    if (securityAnswer !== undefined) {
      settings.security.securityAnswer = securityAnswer;
    }
    
    await writeSettings(settings);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update credentials' }, { status: 500 });
  }
}