import crypto from "crypto";
import { getStorage, type StoredCredentials } from "./storage";

const SCRYPT_PREFIX = "scrypt:";
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, SCRYPT_KEY_LENGTH, SCRYPT_PARAMS, (err, derived) => {
      if (err) reject(err);
      else resolve(derived);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const derived = await scryptAsync(password, salt);
  return `${SCRYPT_PREFIX}${salt.toString("hex")}:${derived.toString("hex")}`;
}

function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Returns true when the secret is a legacy plaintext password (needs upgrade to a hash)
function isLegacyPlaintext(secret: string): boolean {
  return !secret.startsWith(SCRYPT_PREFIX);
}

// Verifies a password against a stored secret. Returns "hash", "plain" (legacy, should be upgraded), or null.
export async function verifyStoredSecret(secret: string | null, password: string): Promise<"hash" | "plain" | null> {
  if (!secret) return null;

  if (isLegacyPlaintext(secret)) {
    return timingSafeEqualString(secret, password) ? "plain" : null;
  }

  const parts = secret.split(":");
  // scrypt:<saltHex>:<hashHex>
  if (parts.length !== 3) return null;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  if (salt.length === 0 || expected.length === 0) return null;

  const derived = await scryptAsync(password, salt);
  if (derived.length !== expected.length) return null;
  return crypto.timingSafeEqual(derived, expected) ? "hash" : null;
}

export async function getCredentials(): Promise<StoredCredentials> {
  const stored = await getStorage().readCredentials();
  return stored ?? { username: "admin", secret: null };
}

export async function setCredentials(updates: {
  username?: string;
  password?: string;
  securityQuestion?: string | null;
  securityAnswer?: string;
}): Promise<void> {
  const current = await getCredentials();
  const username = updates.username?.trim() || current.username;
  const secret = updates.password ? await hashPassword(updates.password) : current.secret;

  let securityQuestion = current.securityQuestion ?? null;
  let securityAnswerHash = current.securityAnswerHash ?? null;
  if (updates.securityQuestion !== undefined) {
    securityQuestion = updates.securityQuestion?.trim() || null;
    // Clearing the question also clears the answer
    if (!securityQuestion) securityAnswerHash = null;
  }
  if (updates.securityAnswer !== undefined) {
    securityAnswerHash = updates.securityAnswer ? await hashPassword(updates.securityAnswer) : null;
  }

  await getStorage().writeCredentials({ username, secret, securityQuestion, securityAnswerHash });
}

// Verifies a recovery answer against the stored hash. Returns null when no
// security question is configured.
export async function verifySecurityAnswer(answer: string): Promise<boolean | null> {
  const credentials = await getCredentials();
  if (!credentials.securityQuestion || !credentials.securityAnswerHash) return null;
  const result = await verifyStoredSecret(credentials.securityAnswerHash, answer);
  return result !== null;
}
