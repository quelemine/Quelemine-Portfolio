import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { AdminSettings, Project } from "@/types/admin";

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

// GET - Fetch all projects
export async function GET() {
  try {
    const settings = await readSettings();
    return NextResponse.json(settings.projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST - Add new project
export async function POST(request: Request) {
  try {
    const project = await request.json();
    const settings = await readSettings();
    
    // Generate new ID
    const maxId = settings.projects.reduce((max, p) => Math.max(max, p.id), 0);
    project.id = maxId + 1;
    
    settings.projects.push(project);
    await writeSettings(settings);
    
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add project' }, { status: 500 });
  }
}

// PUT - Update project
export async function PUT(request: Request) {
  try {
    const updatedProject = await request.json();
    const settings = await readSettings();
    
    const index = settings.projects.findIndex(p => p.id === updatedProject.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    settings.projects[index] = updatedProject;
    await writeSettings(settings);
    
    return NextResponse.json(updatedProject);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE - Delete project
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    
    const settings = await readSettings();
    settings.projects = settings.projects.filter(p => p.id !== id);
    
    await writeSettings(settings);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}