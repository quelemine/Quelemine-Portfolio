import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { AdminSettings } from "@/types/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { readSettings, writeSettings, deepMerge } from "@/lib/settingsStore";

// Explicit allowlist of public-safe settings keys. Anything not listed here
// (credentials, security answers, future sensitive fields) is never returned.
const PUBLIC_SETTINGS_KEYS = [
  "profile", "logo", "loginLogo", "cv", "featuredVideo",
  "projects", "education", "skills", "communication", "languages",
  "workTogether", "whatsapp", "map", "colors", "typography", "siteContent",
] as const;

function stripSecurity(settings: AdminSettings) {
  const source = settings as unknown as Record<string, unknown>;
  const safe: Record<string, unknown> = {};
  for (const key of PUBLIC_SETTINGS_KEYS) {
    if (key in source) safe[key] = source[key];
  }
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
    return NextResponse.json(stripSecurity(settings), {
      headers: { "Cache-Control": "no-store" },
    });
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
    revalidatePath("/");

    return NextResponse.json(stripSecurity(updatedSettings));
  } catch (error) {
    logError("settings write", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
