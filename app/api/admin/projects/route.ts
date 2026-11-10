import { NextResponse } from "next/server";
import type { Project } from "@/types/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { readSettings, writeSettings } from "@/lib/settingsStore";

function logError(error: unknown) {
  const err = error as NodeJS.ErrnoException;
  console.error("projects failed:", err?.code, err?.message);
}

// GET - Fetch all projects
export async function GET(request: Request) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const settings = await readSettings();
    return NextResponse.json(settings.projects);
  } catch (error) {
    logError(error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST - Add new project
export async function POST(request: Request) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const project = await request.json();
    const settings = await readSettings();

    // Generate new ID
    const maxId = settings.projects.reduce((max, p) => Math.max(max, p.id), 0);
    project.id = maxId + 1;

    settings.projects.push(project);
    await writeSettings(settings);

    return NextResponse.json(project);
  } catch (error) {
    logError(error);
    return NextResponse.json({ error: "Failed to add project" }, { status: 500 });
  }
}

// PUT - Update project
export async function PUT(request: Request) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const updatedProject = await request.json();
    const settings = await readSettings();

    const index = settings.projects.findIndex((p: Project) => p.id === updatedProject.id);
    if (index === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    settings.projects[index] = updatedProject;
    await writeSettings(settings);

    return NextResponse.json(updatedProject);
  } catch (error) {
    logError(error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

// DELETE - Delete project
export async function DELETE(request: Request) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0");

    const settings = await readSettings();
    settings.projects = settings.projects.filter((p: Project) => p.id !== id);

    await writeSettings(settings);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
