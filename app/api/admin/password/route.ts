import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { requireAdmin } from "@/lib/adminAuth";
import { getCredentials, setCredentials, verifyStoredSecret } from "@/lib/credentials";

function logError(error: unknown) {
  const err = error as NodeJS.ErrnoException;
  console.error("password update failed:", err?.code, err?.message);
}

function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

const MIN_PASSWORD_LENGTH = 12;

// POST - Verify current password and update stored credentials
export async function POST(request: Request) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const { currentPassword, newPassword, newUsername } = await request.json();

    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
    }

    if (newPassword && newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 });
    }

    const credentials = await getCredentials();
    const envPassword = process.env.ADMIN_PASSWORD || "";

    // Current password must match the env var or the stored credential
    const envValid = envPassword.length > 0 && timingSafeEqualString(currentPassword, envPassword);
    const storedResult = await verifyStoredSecret(credentials.secret, currentPassword);
    const isValid = envValid || storedResult !== null;

    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const updates: { username?: string; password?: string } = {};
    if (newUsername && newUsername.trim()) {
      updates.username = newUsername.trim();
    }
    if (newPassword) {
      updates.password = newPassword;
    }

    if (updates.username || updates.password) {
      await setCredentials(updates);
      revalidatePath("/");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error);
    return NextResponse.json({ error: 'Failed to update credentials' }, { status: 500 });
  }
}
