import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import crypto from "crypto";
import path from "path";
import { existsSync } from "fs";
import { requireAdmin } from "@/lib/adminAuth";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const UPLOAD_TYPES = ['profile', 'cv', 'about', 'logo', 'loginLogo', 'video'] as const;
type UploadType = typeof UPLOAD_TYPES[number];

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']);
const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']);

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

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File must be 25 MB or smaller' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();

    const isImageType = type === 'profile' || type === 'about' || type === 'logo' || type === 'loginLogo';
    if (isImageType && (!IMAGE_EXTENSIONS.has(ext) || !IMAGE_MIME_TYPES.has(file.type))) {
      return NextResponse.json({ error: 'File must be a supported image (jpg, png, gif, webp, bmp)' }, { status: 400 });
    }

    if (type === 'cv' && (ext !== '.pdf' || file.type !== 'application/pdf')) {
      return NextResponse.json({ error: 'CV must be a PDF file' }, { status: 400 });
    }

    if (type === 'video' && (ext !== '.mp4' || file.type !== 'video/mp4')) {
      return NextResponse.json({ error: 'Video must be an MP4 file' }, { status: 400 });
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate a random server-side filename; never trust the client-supplied name
    const filename = `${type}-${crypto.randomUUID()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: publicUrl, filename });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
