import crypto from "crypto";

// Short-lived one-time codes for password recovery (email 2FA).
// In-memory: codes expire after 10 minutes and are invalidated on use.
const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

interface OtpEntry {
  hash: string;
  expiresAt: number;
  attempts: number;
}

const store = new Map<string, OtpEntry>(); // key: username (lowercased)

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export function createOtp(username: string): string {
  const code = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
  store.set(username.toLowerCase(), {
    hash: hashCode(code),
    expiresAt: Date.now() + TTL_MS,
    attempts: 0,
  });
  return code;
}

export function verifyOtp(username: string, code: string): boolean {
  const key = username.toLowerCase();
  const entry = store.get(key);
  if (!entry || entry.expiresAt < Date.now()) {
    store.delete(key);
    return false;
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(key);
    return false;
  }
  entry.attempts += 1;
  const ok = crypto.timingSafeEqual(
    Buffer.from(entry.hash),
    Buffer.from(hashCode(code.trim()))
  );
  if (ok) store.delete(key); // single use
  return ok;
}
