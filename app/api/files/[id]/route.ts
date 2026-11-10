import { NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function logError(error: unknown) {
  const err = error as NodeJS.ErrnoException;
  console.error("file serve failed:", err?.code, err?.message);
}

// GET - Serve an uploaded file. Public, immutable cache, Range support for video seeking.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const file = await getStorage().readUpload(id);
    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const total = file.data.length;
    const baseHeaders: Record<string, string> = {
      "Content-Type": file.mime,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    };

    const range = request.headers.get("range");
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if (match) {
        let start: number;
        let end: number;
        if (match[1] === "" && match[2] !== "") {
          // Suffix range: bytes=-N (last N bytes)
          const suffix = parseInt(match[2], 10);
          start = Math.max(0, total - suffix);
          end = total - 1;
        } else {
          start = match[1] === "" ? 0 : parseInt(match[1], 10);
          end = match[2] === "" ? total - 1 : parseInt(match[2], 10);
        }

        if (start > end || start >= total || Number.isNaN(start) || Number.isNaN(end)) {
          return new NextResponse(null, {
            status: 416,
            headers: { ...baseHeaders, "Content-Range": `bytes */${total}` },
          });
        }
        end = Math.min(end, total - 1);

        const chunk = file.data.subarray(start, end + 1);
        return new NextResponse(new Uint8Array(chunk), {
          status: 206,
          headers: {
            ...baseHeaders,
            "Content-Range": `bytes ${start}-${end}/${total}`,
            "Content-Length": String(chunk.length),
          },
        });
      }
    }

    return new NextResponse(new Uint8Array(file.data), {
      headers: { ...baseHeaders, "Content-Length": String(total) },
    });
  } catch (error) {
    logError(error);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}
