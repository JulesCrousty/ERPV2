import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const hasToken = cookie.includes("AUTH_TOKEN=");

  const protectedPaths = ["/dashboard", "/modules"];

  if (protectedPaths.some((p) => req.url && new URL(req.url).pathname.startsWith(p))) {
    if (!hasToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}
