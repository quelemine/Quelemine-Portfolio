import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { AdminSettings, Education } from "@/types/admin";

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'adminSettings.json');

// Helper function to read settings
async function readSettings(): Promise<AdminSettings> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {
      profile: {
        name: "", title: "", subtitle: "", description: "",
        location: "", availableForWork: true, profileImage: ""
      },
      cv: { url: "", filename: "", uploadDate: "" },
      projects: [],
      education: [],
      colors: {
        primary: "#2563eb", secondary: "#0B1F3A", accent: "#3b82f6",
        background: "#ffffff", text: "#1e293b", cardBackground: "#ffffff"
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
          tags: [], getInTouch: "", downloadCV: "",
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
      security: { password: "" }
    };
  }
}

// Helper function to write settings
async function writeSettings(settings: AdminSettings): Promise<void> {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

// GET - Fetch all education
export async function GET() {
  try {
    const settings = await readSettings();
    return NextResponse.json(settings.education);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch education' }, { status: 500 });
  }
}

// POST - Add new education
export async function POST(request: Request) {
  try {
    const education = await request.json();
    const settings = await readSettings();
    
    // Generate new ID
    const maxId = settings.education.reduce((max, e) => Math.max(max, e.id), 0);
    education.id = maxId + 1;
    
    settings.education.push(education);
    await writeSettings(settings);
    
    return NextResponse.json(education);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add education' }, { status: 500 });
  }
}

// PUT - Update education
export async function PUT(request: Request) {
  try {
    const updatedEducation = await request.json();
    const settings = await readSettings();
    
    const index = settings.education.findIndex(e => e.id === updatedEducation.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Education not found' }, { status: 404 });
    }
    
    settings.education[index] = updatedEducation;
    await writeSettings(settings);
    
    return NextResponse.json(updatedEducation);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update education' }, { status: 500 });
  }
}

// DELETE - Delete education
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    
    const settings = await readSettings();
    settings.education = settings.education.filter(e => e.id !== id);
    
    await writeSettings(settings);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete education' }, { status: 500 });
  }
}