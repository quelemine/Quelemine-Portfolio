import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getStorage } from "@/lib/storage";

// GET - Storage backend status (admin session required)
export async function GET(request: Request) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const storage = getStorage();
    let writable = false;
    try {
      writable = await storage.checkWritable();
    } catch {
      writable = false;
    }

    return NextResponse.json({ storage: storage.kind, writable });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    console.error("health check failed:", err?.code, err?.message);
    return NextResponse.json({ error: "Health check failed" }, { status: 500 });
  }
}
