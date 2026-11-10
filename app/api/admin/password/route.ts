import { NextResponse } from "next/server";
import type { AdminSettings } from "@/types/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { readSettings, writeSettings } from "@/lib/settingsStore";

function logError(error: unknown) {
  const err = error as NodeJS.ErrnoException;
  console.error("password update failed:", err?.code, err?.message);
}

// POST - Verify current password and set new password/username/security
export async function POST(request: Request) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const { currentPassword, newPassword, newUsername, securityQuestion, securityAnswer } = await request.json();

    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
    }

    const settings = await readSettings();

    // Check if current password matches (check both env var and stored password)
    const envPassword = process.env.ADMIN_PASSWORD || "";
    const storedPassword = settings.security?.password || "";

    const isValid = currentPassword === envPassword || currentPassword === storedPassword;

    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Update password, username, and security settings
    if (newPassword) {
      settings.security = { ...(settings.security ?? { username: "admin", password: "", securityQuestion: "", securityAnswer: "" }), password: newPassword };
    }
    if (newUsername) {
      settings.security = { ...(settings.security ?? { username: "admin", password: "", securityQuestion: "", securityAnswer: "" }), username: newUsername };
    }
    if (securityQuestion !== undefined || securityAnswer !== undefined) {
      settings.security = {
        ...(settings.security ?? { username: "admin", password: "", securityQuestion: "", securityAnswer: "" }),
        securityQuestion: securityQuestion ?? settings.security?.securityQuestion ?? "",
        securityAnswer: securityAnswer ?? settings.security?.securityAnswer ?? "",
      };
    }

    await writeSettings(settings);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error);
    return NextResponse.json({ error: 'Failed to update credentials' }, { status: 500 });
  }
}
