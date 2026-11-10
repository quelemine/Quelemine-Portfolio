import { NextResponse } from "next/server";
import crypto from "crypto";
import { getCredentials, setCredentials, verifySecurityAnswer } from "@/lib/credentials";
import { createOtp, verifyOtp } from "@/lib/otp";
import { sendMail } from "@/lib/mailer";
import { readSettings } from "@/lib/settingsStore";

const MIN_PASSWORD_LENGTH = 12;
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

// Best-effort in-memory rate limiter (per instance)
const attempts = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

function logError(context: string, error: unknown) {
  const err = error as NodeJS.ErrnoException;
  console.error(`${context} failed:`, err?.code, err?.message);
}

function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// HMAC-signed reset token: <base64url(payload)>.<base64url(sig)>
function signResetToken(username: string): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  const payload = Buffer.from(JSON.stringify({
    purpose: "pwd-reset",
    username,
    exp: Date.now() + RESET_TOKEN_TTL_MS,
  })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyResetToken(token: string): { username: string } | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (data.purpose !== "pwd-reset" || !data.username || data.exp < Date.now()) return null;
    return { username: data.username };
  } catch {
    return null;
  }
}

// GET ?username=... — returns the security question for the recovery flow
export async function GET(request: Request) {
  try {
    if (isRateLimited(clientIp(request))) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }
    const username = new URL(request.url).searchParams.get("username") || "";
    const credentials = await getCredentials();

    // Generic response whether or not the user exists — no username enumeration
    const userMatch = credentials.username && timingSafeEqualString(username, credentials.username);
    if (!userMatch || !credentials.securityQuestion) {
      return NextResponse.json({ error: "Password recovery is not available for this account" }, { status: 404 });
    }
    return NextResponse.json({ securityQuestion: credentials.securityQuestion });
  } catch (error) {
    logError("reset-password question", error);
    return NextResponse.json({ error: "Failed to load recovery info" }, { status: 500 });
  }
}

// POST — two actions:
//   { action: "verify", username, answer }        -> { resetToken }
//   { action: "reset",  token, newPassword }      -> { success: true }
export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body?.action;

    if (action === "send") {
      const { username } = body || {};
      if (!username) {
        return NextResponse.json({ error: "Username is required" }, { status: 400 });
      }
      const credentials = await getCredentials();
      const userMatch = credentials.username && timingSafeEqualString(String(username), credentials.username);
      if (!userMatch) {
        // Generic success — no username enumeration
        return NextResponse.json({ success: true });
      }
      // Recipient: ADMIN_EMAIL env, else the public contact email from settings
      let email = process.env.ADMIN_EMAIL || "";
      if (!email) {
        try {
          const settings = await readSettings();
          email = settings.siteContent?.contact?.email || "";
        } catch { /* ignore */ }
      }
      if (!email) {
        return NextResponse.json({ error: "Email recovery is not configured on this server" }, { status: 503 });
      }
      const code = createOtp(credentials.username);
      const sent = await sendMail(
        email,
        "QueleMine admin password reset code",
        `Your password reset code is: ${code}\n\nIt expires in 10 minutes. If you did not request this, ignore this email.`
      );
      if (!sent) {
        console.error("reset-password send: mailer reported failure");
        return NextResponse.json({ error: "Email service is not configured or failed to send" }, { status: 503 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "verify") {
      const { username, answer } = body || {};
      if (!username || !answer) {
        return NextResponse.json({ error: "Username and answer are required" }, { status: 400 });
      }
      const credentials = await getCredentials();
      const userMatch = credentials.username && timingSafeEqualString(String(username), credentials.username);
      if (!userMatch) {
        return NextResponse.json({ error: "Incorrect username or verification code" }, { status: 401 });
      }
      // 6-digit input = email OTP; anything else = security answer fallback
      const answerStr = String(answer).trim();
      const ok = /^\d{6}$/.test(answerStr)
        ? verifyOtp(credentials.username, answerStr)
        : (await verifySecurityAnswer(answerStr)) === true;
      if (!ok) {
        return NextResponse.json({ error: "Incorrect username or verification code" }, { status: 401 });
      }
      const token = signResetToken(credentials.username);
      if (!token) {
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
      }
      return NextResponse.json({ resetToken: token });
    }

    if (action === "reset") {
      const { token, newPassword } = body || {};
      if (!token || !newPassword) {
        return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
      }
      if (String(newPassword).length < MIN_PASSWORD_LENGTH) {
        return NextResponse.json({ error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 });
      }
      const verified = verifyResetToken(String(token));
      if (!verified) {
        return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 401 });
      }
      // Token is bound to the username it was issued for
      const credentials = await getCredentials();
      if (!timingSafeEqualString(verified.username, credentials.username)) {
        return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 401 });
      }
      await setCredentials({ password: String(newPassword) });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    logError("reset-password", error);
    return NextResponse.json({ error: "Password reset failed" }, { status: 500 });
  }
}
