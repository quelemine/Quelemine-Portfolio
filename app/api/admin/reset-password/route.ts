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

// POST - Reset password using security question
export async function POST(request: Request) {
  try {
    const { username, securityAnswer, newPassword } = await request.json();

    if (!username || !securityAnswer) {
      return NextResponse.json({ error: 'Username and security answer are required' }, { status: 400 });
    }

    const settings = await readSettings();
    
    // Verify username (allow both stored username and default admin)
    if (username !== settings.security.username && username !== 'admin') {
      return NextResponse.json({ error: 'Username not found' }, { status: 404 });
    }

    // If no security answer is set, allow any answer for first-time setup
    const storedAnswer = settings.security.securityAnswer || "";
    if (storedAnswer && securityAnswer.toLowerCase() !== storedAnswer.toLowerCase()) {
      return NextResponse.json({ error: 'Incorrect security answer' }, { status: 401 });
    }

    // Only update password if newPassword is provided (final step)
    if (newPassword) {
      settings.security.password = newPassword;
      await writeSettings(settings);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}

// GET - Get security question for username
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const settings = await readSettings();
    
    // If username matches or is the default admin, allow it
    if (username !== settings.security.username && username !== 'admin') {
      return NextResponse.json({ error: 'Username not found' }, { status: 404 });
    }

    // If no security question is set, return a default one
    const securityQuestion = settings.security.securityQuestion || "What is your favorite color?";
    
    return NextResponse.json({ securityQuestion });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get security question' }, { status: 500 });
  }
}
