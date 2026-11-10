import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { AdminSettings } from "@/types/admin";
import { createSessionToken, sessionCookieHeader } from "@/lib/adminAuth";

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'adminSettings.json');

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

// Helper function to read settings
async function readSettings(): Promise<AdminSettings> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {
      profile: {
        name: "",
        title: "",
        subtitle: "",
        description: "",
        location: "",
        availableForWork: true,
        profileImage: ""
      },
      logo: { url: "" },
      loginLogo: { url: "" },
      cv: { url: "", filename: "", uploadDate: "" },
      projects: [],
      education: [],
      colors: {
        primary: "", secondary: "", accent: "",
        background: "", text: "", cardBackground: ""
      },
      typography: {
        fontFamily: "",
        fontSize: { base: "", h1: "", h2: "", h3: "", small: "" },
        lineHeight: { normal: "", relaxed: "" },
        textAlign: "left",
        fontWeight: { normal: "", medium: "", bold: "" }
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
          tags: [], getInTouch: "", downloadCV: "", image: "",
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
      security: { username: "admin", password: "", securityQuestion: "", securityAnswer: "" }
    };
  }
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

    const envPassword = process.env.ADMIN_PASSWORD || "";
    const settings = await readSettings();
    const storedUsername = settings.security.username || "admin";
    const storedPassword = settings.security.password || "";

    // Check username and password with timing-safe comparisons
    const isUsernameValid = timingSafeEqualString(username, storedUsername);
    const isPasswordValid =
      (envPassword.length > 0 && timingSafeEqualString(password, envPassword)) ||
      (storedPassword.length > 0 && timingSafeEqualString(password, storedPassword));

    if (isUsernameValid && isPasswordValid) {
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
