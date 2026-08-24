import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'profile' or 'cv'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!type || !['profile', 'cv', 'about', 'logo', 'loginLogo'].includes(type)) {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
    }

    // Validate file type
    if ((type === 'profile' || type === 'about' || type === 'logo' || type === 'loginLogo') && !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Image must be an image file' }, { status: 400 });
    }

    if (type === 'cv' && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'CV must be a PDF file' }, { status: 400 });
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${type}-${timestamp}${path.extname(file.name)}`;
    const filepath = path.join(uploadDir, filename);

    // Convert file to buffer and write
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: publicUrl, filename });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}