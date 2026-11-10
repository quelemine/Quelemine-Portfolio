import crypto from "crypto";
import { NextResponse } from "next/server";

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 28800; // 8 hours

const MIN_SECRET_LENGTH = 32;

function getSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    return null;
  }
  return secret;
}

export function createSessionToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;

  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_MAX_AGE * 1000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | null | undefined): boolean {
  const secret = getSecret();
  if (!secret || !token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;

  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export function getSessionTokenFromRequest(request: Request): string | undefined {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (name === SESSION_COOKIE) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return undefined;
}

export function isAdminAuthenticated(request: Request): boolean {
  return verifySessionToken(getSessionTokenFromRequest(request));
}

export function requireAdmin(request: Request): NextResponse | null {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function buildCookieHeader(value: string, maxAge: number): string {
  const parts = [
    `${SESSION_COOKIE}=${value}`,
    "HttpOnly",
    "SameSite=Strict",
    "Path=/",
    `Max-Age=${maxAge}`,
  ];
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }
  return parts.join("; ");
}

export function sessionCookieHeader(token: string): string {
  return buildCookieHeader(token, SESSION_MAX_AGE);
}

export function clearedSessionCookieHeader(): string {
  return buildCookieHeader("", 0);
}
