import mysql from "mysql2/promise";
import type { NewUpload, StorageBackend, StoredCredentials, StoredUpload } from "./types";

let pool: mysql.Pool | null = null;
let tablesReady: Promise<void> | null = null;
let packetBytes: number | null = null;

function getPool(): mysql.Pool {
  if (pool) return pool;
  if (process.env.DATABASE_URL) {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      connectionLimit: 5,
    });
  } else {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectionLimit: 5,
    });
  }
  return pool;
}

async function ensureTables(): Promise<void> {
  if (!tablesReady) {
    tablesReady = (async () => {
      const p = getPool();
      await p.query(`CREATE TABLE IF NOT EXISTS settings (
        id TINYINT PRIMARY KEY,
        data LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
      await p.query(`CREATE TABLE IF NOT EXISTS uploads (
        id CHAR(36) PRIMARY KEY,
        type VARCHAR(32),
        filename VARCHAR(255),
        mime VARCHAR(100),
        size INT,
        data LONGBLOB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      await p.query(`CREATE TABLE IF NOT EXISTS credentials (
        id TINYINT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        secret VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
      await p.query(`CREATE TABLE IF NOT EXISTS _probe (id INT PRIMARY KEY)`);
    })();
  }
  return tablesReady;
}

async function queryMaxAllowedPacket(): Promise<number> {
  if (packetBytes !== null) return packetBytes;
  const [rows] = await getPool().query<mysql.RowDataPacket[]>("SHOW VARIABLES LIKE 'max_allowed_packet'");
  const value = rows[0]?.Value;
  packetBytes = typeof value === "string" ? parseInt(value, 10) : 64 * 1024 * 1024;
  if (!Number.isFinite(packetBytes) || packetBytes <= 0) {
    packetBytes = 64 * 1024 * 1024;
  }
  return packetBytes;
}

export const mysqlBackend: StorageBackend = {
  kind: "mysql",

  async readSettings() {
    await ensureTables();
    const [rows] = await getPool().query<mysql.RowDataPacket[]>(
      "SELECT data FROM settings WHERE id = 1"
    );
    const raw = rows[0]?.data;
    if (!raw) return null;
    try {
      return JSON.parse(raw as string) as Record<string, unknown>;
    } catch {
      return null;
    }
  },

  async writeSettings(data) {
    await ensureTables();
    await getPool().query(
      `INSERT INTO settings (id, data) VALUES (1, ?)
       ON DUPLICATE KEY UPDATE data = VALUES(data)`,
      [JSON.stringify(data)]
    );
  },

  async readCredentials() {
    await ensureTables();
    const [rows] = await getPool().query<mysql.RowDataPacket[]>(
      "SELECT username, secret FROM credentials WHERE id = 1"
    );
    const row = rows[0];
    if (!row) return null;
    return { username: String(row.username), secret: (row.secret as string) ?? null };
  },

  async writeCredentials(credentials: StoredCredentials) {
    await ensureTables();
    await getPool().query(
      `INSERT INTO credentials (id, username, secret) VALUES (1, ?, ?)
       ON DUPLICATE KEY UPDATE username = VALUES(username), secret = VALUES(secret)`,
      [credentials.username, credentials.secret]
    );
  },

  async saveUpload(upload: NewUpload) {
    await ensureTables();
    await getPool().query(
      "INSERT INTO uploads (id, type, filename, mime, size, data) VALUES (?, ?, ?, ?, ?, ?)",
      [upload.id, upload.type, upload.filename, upload.mime, upload.size, upload.data]
    );
  },

  async readUpload(id: string): Promise<StoredUpload | null> {
    await ensureTables();
    const [rows] = await getPool().query<mysql.RowDataPacket[]>(
      "SELECT mime, size, data FROM uploads WHERE id = ?",
      [id]
    );
    const row = rows[0];
    if (!row) return null;
    const data = row.data as Buffer;
    return { mime: String(row.mime), size: Number(row.size), data };
  },

  async checkWritable() {
    try {
      await ensureTables();
      const p = getPool();
      await p.query("INSERT INTO _probe (id) VALUES (1) ON DUPLICATE KEY UPDATE id = 1");
      await p.query("DELETE FROM _probe WHERE id = 1");
      return true;
    } catch {
      return false;
    }
  },

  async maxPacketBytes() {
    await ensureTables();
    return queryMaxAllowedPacket();
  },
};
