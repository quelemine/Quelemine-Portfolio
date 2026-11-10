import { NextResponse } from "next/server";
import { clearedSessionCookieHeader } from "@/lib/adminAuth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.headers.set("Set-Cookie", clearedSessionCookieHeader());
  return response;
}
