import { NextResponse } from "next/server";
import crypto from "crypto";
import path from "path";
import { requireAdmin } from "@/lib/adminAuth";
import { UPLOAD_LIMITS, clampUploadLimit, type UploadLimitKind } from "@/lib/uploadLimits";
import { getStorage } from "@/lib/storage";

const UPLOAD_TYPES = ['profile', 'cv', 'about', 'logo', 'loginLogo', 'video'] as const;
type UploadType = typeof UPLOAD_TYPES[number];

const TYPE_TO_KIND: Record<UploadType, UploadLimitKind> = {
  profile: 'image',
  about: 'image',
  logo: 'image',
  loginLogo: 'image',
  cv: 'pdf',
  video: 'video',
};

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']);
const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']);

function logError(error: unknown) {
  const err = error as NodeJS.ErrnoException;
  console.error("upload failed:", err?.code, err?.message);
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

    const bytes = Buffer.from(await file.arrayBuffer());
    const id = crypto.randomUUID();

    await storage.saveUpload({
      id,
      type: uploadType,
      filename: file.name,
      mime: file.type || 'application/octet-stream',
      size: bytes.length,
      data: bytes,
    });

    return NextResponse.json({ url: `/api/files/${id}`, filename: file.name });
  } catch (error) {
    logError(error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
