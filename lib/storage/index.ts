import { fileBackend } from "./file";
import { mysqlBackend } from "./mysql";
import type { StorageBackend } from "./types";

export type { NewUpload, StorageBackend, StoredCredentials, StoredUpload } from "./types";

function detectBackend(): StorageBackend {
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const hasDbParts =
    !!process.env.DB_HOST &&
    !!process.env.DB_USER &&
    !!process.env.DB_PASSWORD &&
    !!process.env.DB_NAME;
  return hasDatabaseUrl || hasDbParts ? mysqlBackend : fileBackend;
}

let backend: StorageBackend | null = null;

export function getStorage(): StorageBackend {
  if (!backend) {
    backend = detectBackend();
  }
  return backend;
}
