import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function GET(request: Request) {
  return NextResponse.json({ authed: isAdminAuthenticated(request) });
}
