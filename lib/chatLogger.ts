// lib/chatLogger.ts
// Stores chat activity logs in localStorage under key "chat_logs".
// Each session is identified by a unique sessionId.
// No sensitive data is sent anywhere — all data stays in the browser.

export interface ChatLogEntry {
  role: "bot" | "user";
  text: string;
  timestamp: string; // ISO string
  status: "success" | "error";
}

export interface ChatSession {
  sessionId: string;
  userName: string;
  startedAt: string;   // ISO string
  lastActiveAt: string; // ISO string
  channel: "website";
  messages: ChatLogEntry[];
}

const STORAGE_KEY = "iq_chat_logs";

function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function createSession(userName: string): string {
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const session: ChatSession = {
    sessionId,
    userName,
    startedAt: now,
    lastActiveAt: now,
    channel: "website",
    messages: [],
  };
  const sessions = loadSessions();
  sessions.unshift(session);
  saveSessions(sessions);
  return sessionId;
}

export function logMessage(
  sessionId: string,
  role: "bot" | "user",
  text: string,
  status: "success" | "error" = "success"
) {
  const sessions = loadSessions();
  const idx = sessions.findIndex((s) => s.sessionId === sessionId);
  if (idx === -1) return;
  const entry: ChatLogEntry = { role, text, timestamp: new Date().toISOString(), status };
  sessions[idx].messages.push(entry);
  sessions[idx].lastActiveAt = entry.timestamp;
  saveSessions(sessions);
}

export function getAllSessions(): ChatSession[] {
  return loadSessions();
}

export function clearAllSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function deleteSession(sessionId: string): void {
  const sessions = loadSessions();
  const filtered = sessions.filter((s) => s.sessionId !== sessionId);
  saveSessions(filtered);
}
