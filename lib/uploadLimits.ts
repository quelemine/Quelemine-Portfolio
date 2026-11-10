// Shared upload limits (bytes). Used by both the client (accept attributes,
// size pre-checks) and the server (enforcement). The server additionally clamps
// these to the database's max_allowed_packet when running on MySQL.
export const UPLOAD_LIMITS = {
  image: 5 * 1024 * 1024,   // 5 MB
  pdf: 10 * 1024 * 1024,    // 10 MB
  video: 25 * 1024 * 1024,  // 25 MB
} as const;

export type UploadLimitKind = keyof typeof UPLOAD_LIMITS;

export function formatLimit(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${bytes / (1024 * 1024)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}
