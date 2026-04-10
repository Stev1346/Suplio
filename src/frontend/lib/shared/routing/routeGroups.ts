const DJ_PUBLIC_PATH_PREFIXES = [
    "/dj/login",
    "/dj/signup",
    "/dj/forgot-password",
    "/dj/update-password"
] as const;

export function isDjPath(pathname: string | null): boolean{
    if(!pathname) return false;

    return pathname === "/dj" || pathname === "/dj/" || pathname.startsWith("/dj/");
}

export function isDjPrivatePath(pathname: string | null): boolean {
    if(!isDjPath(pathname)) return false;

    return !isDjLandingPath(pathname) && !isDjPublicPath(pathname);
}

export function isDjPublicPath(pathname: string | null): boolean {
    if(!pathname) return false;

    return DJ_PUBLIC_PATH_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
}

export function isDjLandingPath(pathname: string | null): boolean {
    if(!pathname) return false;

    return pathname === "/dj" || pathname === "/dj/";
  }

export function isGuestEventPath(pathname: string | null): boolean {
    if(!pathname) return false;

    return pathname.startsWith("/event/")
}