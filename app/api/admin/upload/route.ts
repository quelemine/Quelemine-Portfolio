import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import path from "path";
import sharp from "sharp";
import { requireAdmin } from "@/lib/adminAuth";
import { UPLOAD_LIMITS, clampUploadLimit, type UploadLimitKind } from "@/lib/uploadLimits";
import { getStorage } from "@/lib/storage";

const UPLOAD_TYPES = ['profile', 'cv', 'about', 'logo', 'loginLogo', 'video', 'project'] as const;
type UploadType = typeof UPLOAD_TYPES[number];

const TYPE_TO_KIND: Record<UploadType, UploadLimitKind> = {
  profile: 'image',
  about: 'image',
  logo: 'image',
  loginLogo: 'image',
  project: 'image',
  cv: 'pdf',
  video: 'video',
};

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']);
const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']);

function logError(error: unknown) {
  const err = error as NodeJS.ErrnoException;
  console.error("upload failed:", err?.code, err?.message);
}

// Verify the actual file content matches the declared type (magic bytes).
function contentMatches(bytes: Buffer, kind: UploadLimitKind, ext: string): boolean {
  if (kind === "image") {
    if (ext === ".png") {
      return bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
    }
    if (ext === ".jpg" || ext === ".jpeg") {
      return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    }
    if (ext === ".webp") {
      return bytes.length > 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
    }
    if (ext === ".gif") {
      return bytes.length > 6 && bytes.toString("ascii", 0, 3) === "GIF";
    }
    if (ext === ".bmp") {
      return bytes.length > 2 && bytes[0] === 0x42 && bytes[1] === 0x4d;
    }
    return false;
  }
  if (kind === "pdf") {
    return bytes.length > 5 && bytes.toString("ascii", 0, 5) === "%PDF-";
  }
  if (kind === "video") {
    // MP4/MOV: "ftyp" box signature at offset 4
    return bytes.length > 8 && bytes.toString("ascii", 4, 8) === "ftyp";
  }
  return false;
}

// Resize large images (max 1200px wide, aspect ratio preserved) and recompress.
// Falls back to the original bytes if optimization fails.
async function optimizeImage(bytes: Buffer, ext: string): Promise<Buffer> {
  try {
    let pipeline = sharp(bytes).rotate().resize({ width: 1200, withoutEnlargement: true });
    if (ext === ".png") {
      return await pipeline.png({ quality: 80, compressionLevel: 9 }).toBuffer();
    }
    if (ext === ".webp") {
      return await pipeline.webp({ quality: 80 }).toBuffer();
    }
    return await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  } catch {
    return bytes;
  }
}

export async function POST(request: Request) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!type || !UPLOAD_TYPES.includes(type as UploadType)) {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
    }
    const uploadType = type as UploadType;

    const storage = getStorage();
    const maxPacket = await storage.maxPacketBytes();
    const limit = clampUploadLimit(TYPE_TO_KIND[uploadType], maxPacket);

    if (file.size > limit) {
      return NextResponse.json({ error: `File must be ${Math.floor(limit / (1024 * 1024))} MB or smaller` }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();

    const isImageType = TYPE_TO_KIND[uploadType] === 'image';
    if (isImageType && (!IMAGE_EXTENSIONS.has(ext) || !IMAGE_MIME_TYPES.has(file.type))) {
      return NextResponse.json({ error: 'File must be a supported image (jpg, png, gif, webp, bmp)' }, { status: 400 });
    }

    if (uploadType === 'cv' && (ext !== '.pdf' || file.type !== 'application/pdf')) {
      return NextResponse.json({ error: 'CV must be a PDF file' }, { status: 400 });
    }

    if (uploadType === 'video' && (ext !== '.mp4' || file.type !== 'video/mp4')) {
      return NextResponse.json({ error: 'Video must be an MP4 file' }, { status: 400 });
    }

    let bytes = Buffer.from(await file.arrayBuffer());
    const kind = TYPE_TO_KIND[uploadType];

    // Reject files whose actual content does not match the declared type
    if (!contentMatches(bytes, kind, ext)) {
      return NextResponse.json({ error: 'File content does not match its type' }, { status: 400 });
    }

    if (kind === 'image') {
      bytes = Buffer.from(await optimizeImage(bytes, ext));
    }

    const id = crypto.randomUUID();

    await storage.saveUpload({
      id,
      type: uploadType,
      filename: file.name,
      mime: file.type || 'application/octet-stream',
      size: bytes.length,
      data: bytes,
    });
    revalidatePath("/");

    return NextResponse.json({ url: `/api/files/${id}`, filename: file.name });
  } catch (error) {
    logError(error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
