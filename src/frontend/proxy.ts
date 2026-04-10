import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/proxy";
import { isDjLandingPath, isDjPrivatePath, isDjPublicPath } from "./lib/shared/routing/routeGroups";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname === "/auth/callback" || pathname === "/auth/callback/" ) {
        return NextResponse.next({ request });
      }

    const { supabaseResponse, user } = await updateSession(request);

    const needsVerify = user && user.email && !user.email_confirmed_at;
    const canAccessDjApp = Boolean(user && !needsVerify);
    const verifySafe = isDjPublicPath(pathname) || isDjLandingPath(pathname) || pathname.startsWith("/auth/");

    if(needsVerify && !verifySafe){
        const url = request.nextUrl.clone();
        url.pathname = "/dj/login";
        url.searchParams.set("error", "verify_email");
        return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/auth/")) {
        return supabaseResponse;
    }

    const isDjPrivate = isDjPrivatePath(pathname);

    if (isDjPrivate && !user) {
        const url = request.nextUrl.clone();
        url.pathname = "/dj/login";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
    }

    if ((pathname === "/dj/signup") && canAccessDjApp) {
        const url = request.nextUrl.clone();
        url.pathname = "/dj/dashboard";
        return NextResponse.redirect(url);
    }

    if ((pathname === "/dj/login") && canAccessDjApp) {
        const url = request.nextUrl.clone();
        url.pathname = "/dj/dashboard";
        return NextResponse.redirect(url);
    }

    if (isDjLandingPath(pathname) && canAccessDjApp) {
        const url = request.nextUrl.clone();
        url.pathname = "/dj/dashboard";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ]
}