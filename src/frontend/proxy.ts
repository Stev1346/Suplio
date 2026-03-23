// src/frontend/proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { verifySessionEdge } from "@/lib/server/auth/dashboard-session";

const COOKIE_NAME = "dj_session";

function isDjPublicPath(pathname: string) {
  return pathname === "/dj" || pathname === "/dj/login" || pathname === "/dj/signup";
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/dj")) return NextResponse.next();

  if (isDjPublicPath(pathname)) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySessionEdge(token);

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = `/dj/login`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dj/dashboard/:path*", "/dj/events/:path*", "/dj/profile/:path*"],
};