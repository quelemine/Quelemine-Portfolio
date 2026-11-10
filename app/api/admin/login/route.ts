import { NextResponse } from "next/server";
import crypto from "crypto";
import { createSessionToken, sessionCookieHeader } from "@/lib/adminAuth";
import { getCredentials, setCredentials, verifyStoredSecret } from "@/lib/credentials";

// Rate limiting: max 5 failed attempts per IP per 15 minutes
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    attempts.set(ip, { count: 0, resetAt: now + WINDOW_MS });
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// POST - Verify username and password, set session cookie on success
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const token = createSessionToken();
    if (!token) {
      return NextResponse.json({ error: 'Authentication is not configured' }, { status: 500 });
    }

    const credentials = await getCredentials();
    const envPassword = process.env.ADMIN_PASSWORD || "";

    // Username must match the stored username; password matches the env var
    // (constant-time) or the stored credential secret.
    const isUsernameValid = timingSafeEqualString(username, credentials.username);
    const envPasswordValid = envPassword.length > 0 && timingSafeEqualString(password, envPassword);
    const storedResult = await verifyStoredSecret(credentials.secret, password);
    const isPasswordValid = envPasswordValid || storedResult !== null;

    if (isUsernameValid && isPasswordValid) {
      // Upgrade a legacy plaintext password to a scrypt hash on first successful login
      if (storedResult === "plain") {
        try {
          await setCredentials({ password });
        } catch {
          // Non-fatal: login still succeeds
        }
      }
      attempts.delete(ip);
      const response = NextResponse.json({ success: true });
      response.headers.set("Set-Cookie", sessionCookieHeader(token));
      return response;
    } else {
      recordFailedAttempt(ip);
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
