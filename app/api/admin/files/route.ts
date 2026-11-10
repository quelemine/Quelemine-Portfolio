import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { getStorage } from "@/lib/storage";
import { readSettings } from "@/lib/settingsStore";
import type { AdminSettings } from "@/types/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FILES_PREFIX = "/api/files/";
const SWEEP_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function logError(context: string, error: unknown) {
  const err = error as NodeJS.ErrnoException;
  console.error(`${context} failed:`, err?.code, err?.message);
}

// Collect every /api/files/<id> URL referenced by settings (projects, images, cv, video)
function collectReferencedIds(settings: AdminSettings): Set<string> {
  const ids = new Set<string>();
  const add = (value?: string) => {
    if (value && value.startsWith(FILES_PREFIX)) {
      ids.add(value.slice(FILES_PREFIX.length));
    }
  };

  add(settings.profile?.profileImage);
  add(settings.logo?.url);
  add(settings.loginLogo?.url);
  add(settings.cv?.url);
  add(settings.featuredVideo?.url);
  add(settings.siteContent?.about?.image);
  settings.projects?.forEach((p) => add(p.image));
  return ids;
}

// DELETE /api/admin/files?id=<uuid> — delete an upload only if unreferenced
export async function DELETE(request: Request) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const id = new URL(request.url).searchParams.get("id") || "";
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const settings = await readSettings();
    if (collectReferencedIds(settings).has(id)) {
      return NextResponse.json({ error: "File is still in use" }, { status: 409 });
    }

    await getStorage().deleteUpload(id);
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("file delete", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}

// POST /api/admin/files { action: "cleanup" } — delete unreferenced uploads older than 24h
export async function POST(request: Request) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;

    const body = await request.json().catch(() => ({}));
    if (body?.action !== "cleanup") {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const settings = await readSettings();
    const referenced = collectReferencedIds(settings);
    const cutoff = Date.now() - SWEEP_MAX_AGE_MS;
    const storage = getStorage();
    const uploads = await storage.listUploads();

    let deleted = 0;
    for (const upload of uploads) {
      if (referenced.has(upload.id)) continue;
      // Uploads with unknown age (createdAt null) are treated as old enough to sweep
      if (upload.createdAt !== null && upload.createdAt > cutoff) continue;
      await storage.deleteUpload(upload.id);
      deleted++;
    }

    if (deleted > 0) revalidatePath("/");
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    logError("file cleanup", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
