import { NextResponse } from "next/server";
import type { Education } from "@/types/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { readSettings, writeSettings } from "@/lib/settingsStore";

function logError(error: unknown) {
  const err = error as NodeJS.ErrnoException;
  console.error("education failed:", err?.code, err?.message);
}

// GET - Fetch all education
export async function GET(request: Request) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const settings = await readSettings();
    return NextResponse.json(settings.education);
  } catch (error) {
    logError(error);
    return NextResponse.json({ error: "Failed to fetch education" }, { status: 500 });
  }
}

// POST - Add new education
export async function POST(request: Request) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const education = await request.json();
    const settings = await readSettings();

    // Generate new ID
    const maxId = settings.education.reduce((max, e) => Math.max(max, e.id), 0);
    education.id = maxId + 1;

    settings.education.push(education);
    await writeSettings(settings);

    return NextResponse.json(education);
  } catch (error) {
    logError(error);
    return NextResponse.json({ error: "Failed to add education" }, { status: 500 });
  }
}

// PUT - Update education
export async function PUT(request: Request) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const updatedEducation = await request.json();
    const settings = await readSettings();

    const index = settings.education.findIndex((e: Education) => e.id === updatedEducation.id);
    if (index === -1) {
      return NextResponse.json({ error: "Education not found" }, { status: 404 });
    }

    settings.education[index] = updatedEducation;
    await writeSettings(settings);

    return NextResponse.json(updatedEducation);
  } catch (error) {
    logError(error);
    return NextResponse.json({ error: "Failed to update education" }, { status: 500 });
  }
}

// DELETE - Delete education
export async function DELETE(request: Request) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0");

    const settings = await readSettings();
    settings.education = settings.education.filter((e: Education) => e.id !== id);

    await writeSettings(settings);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error);
    return NextResponse.json({ error: "Failed to delete education" }, { status: 500 });
  }
}
