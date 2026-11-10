export interface StoredCredentials {
  username: string;
  // Either a "scrypt:<saltHex>:<hashHex>" string or a legacy plaintext password
  secret: string | null;
}

export interface NewUpload {
  id: string;
  type: string;
  filename: string;
  mime: string;
  size: number;
  data: Buffer;
}

export interface StoredUpload {
  mime: string;
  size: number;
  data: Buffer;
}

export interface StorageBackend {
  kind: "mysql" | "file";
  readSettings(): Promise<Record<string, unknown> | null>;
  writeSettings(data: Record<string, unknown>): Promise<void>;
  readCredentials(): Promise<StoredCredentials | null>;
  writeCredentials(credentials: StoredCredentials): Promise<void>;
  saveUpload(upload: NewUpload): Promise<void>;
  readUpload(id: string): Promise<StoredUpload | null>;
  deleteUpload(id: string): Promise<void>;
  listUploads(): Promise<{ id: string; createdAt: number | null }[]>;
  checkWritable(): Promise<boolean>;
  // Returns the server's max_allowed_packet in bytes, or Infinity when not applicable
  maxPacketBytes(): Promise<number>;
}
