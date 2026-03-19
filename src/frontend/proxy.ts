// src/frontend/proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { verifySessionEdge } from "@/lib/edge/dashboard-session";

const COOKIE_NAME = "dj_session";

export async function proxy(req: NextRequest) {
  const parts = req.nextUrl.pathname.split("/").filter(Boolean);
  const isDashboard = parts[0] === "dashboard" && parts[1];
  const isLogin = isDashboard && parts[2] === "login";

  if (!isDashboard || isLogin) return NextResponse.next();

  const eventCode = parts[1];
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySessionEdge(token);

  if (!session || session.eventCode !== eventCode) {
    const url = req.nextUrl.clone();
    url.pathname = `/dashboard/${eventCode}/login`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};