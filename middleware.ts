import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { admin } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("firebase_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await admin.auth().verifyIdToken(token);
    return NextResponse.next();
  } catch (error) {
    console.error("Invalid token:", error);
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"],
};
