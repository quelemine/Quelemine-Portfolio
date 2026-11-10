import { NextResponse } from "next/server";
import type { AdminSettings } from "@/types/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { readSettings, writeSettings, deepMerge } from "@/lib/settingsStore";

function stripSecurity(settings: AdminSettings) {
  const { security, ...safe } = settings as AdminSettings & { security?: unknown };
  return safe;
}

function logError(context: string, error: unknown) {
  const err = error as NodeJS.ErrnoException;
  console.error(`${context} failed:`, err?.code, err?.message);
}

// GET - Fetch all settings (public for the site, credentials stripped)
export async function GET() {
  try {
    const settings = await readSettings();
    return NextResponse.json(stripSecurity(settings));
  } catch (error) {
    logError("settings read", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

// PUT - Update settings (admin session required)
export async function PUT(request: Request) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const updates = await request.json();
    // Credentials can never be written through the settings endpoint
    if (updates && typeof updates === "object") {
      delete updates.security;
    }

    const currentSettings = await readSettings();
    const updatedSettings = deepMerge(currentSettings, updates);
    // Preserve any legacy security section untouched
    updatedSettings.security = currentSettings.security;

    await writeSettings(updatedSettings);

    return NextResponse.json(stripSecurity(updatedSettings));
  } catch (error) {
    logError("settings write", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
