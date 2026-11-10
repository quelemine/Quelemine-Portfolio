import { promises as fs } from "fs";
import path from "path";
import type { NewUpload, StorageBackend, StoredCredentials, StoredUpload } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "adminSettings.json");
const CREDENTIALS_FILE = path.join(DATA_DIR, "credentials.json");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const UPLOAD_INDEX_FILE = path.join(UPLOAD_DIR, "index.json");
const PROBE_FILE = path.join(DATA_DIR, ".probe");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function readJson(file: string): Promise<Record<string, unknown> | null> {
  try {
    return JSON.parse(await fs.readFile(file, "utf-8"));
  } catch {
    return null;
  }
}

interface UploadIndexEntry {
  mime: string;
  size: number;
  createdAt?: number;
}

async function readUploadIndex(): Promise<Record<string, UploadIndexEntry>> {
  const index = await readJson(UPLOAD_INDEX_FILE);
  return (index as Record<string, UploadIndexEntry>) ?? {};
}

async function writeUploadIndex(index: Record<string, UploadIndexEntry>) {
  await fs.writeFile(UPLOAD_INDEX_FILE, JSON.stringify(index, null, 2), "utf-8");
}

export const fileBackend: StorageBackend = {
  kind: "file",

  async readSettings() {
    return readJson(SETTINGS_FILE);
  },

  async writeSettings(data) {
    await ensureDir(DATA_DIR);
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(data, null, 2), "utf-8");
  },

  async readCredentials() {
    const creds = await readJson(CREDENTIALS_FILE);
    if (creds && typeof creds.username === "string") {
      return { username: creds.username, secret: (creds.secret as string) ?? null };
    }
    // Migrate legacy credentials stored inside the settings file
    const settings = await readJson(SETTINGS_FILE);
    const security = settings?.security as { username?: string; password?: string } | undefined;
    if (security && (security.username || security.password)) {
      return { username: security.username || "admin", secret: security.password || null };
    }
    return null;
  },

  async writeCredentials(credentials: StoredCredentials) {
    await ensureDir(DATA_DIR);
    await fs.writeFile(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2), "utf-8");
  },

  async saveUpload(upload: NewUpload) {
    await ensureDir(UPLOAD_DIR);
    await fs.writeFile(path.join(UPLOAD_DIR, upload.id), upload.data);
    const index = await readUploadIndex();
    index[upload.id] = { mime: upload.mime, size: upload.size, createdAt: Date.now() };
    await writeUploadIndex(index);
  },

  async readUpload(id: string): Promise<StoredUpload | null> {
    const index = await readUploadIndex();
    const meta = index[id];
    if (!meta) return null;
    try {
      const data = await fs.readFile(path.join(UPLOAD_DIR, id));
      return { mime: meta.mime, size: meta.size, data };
    } catch {
      return null;
    }
  },

  async deleteUpload(id: string) {
    const index = await readUploadIndex();
    if (index[id]) {
      delete index[id];
      await writeUploadIndex(index);
    }
    await fs.unlink(path.join(UPLOAD_DIR, id)).catch(() => {});
  },

  async listUploads() {
    const index = await readUploadIndex();
    return Object.keys(index).map((id) => ({
      id,
      createdAt: index[id].createdAt ?? null,
    }));
  },

  async checkWritable() {
    try {
      await ensureDir(DATA_DIR);
      await fs.writeFile(PROBE_FILE, "ok", "utf-8");
      await fs.unlink(PROBE_FILE);
      return true;
    } catch {
      return false;
    }
  },

  async maxPacketBytes() {
    return Infinity;
  },
};
