export function isActivePath(pathname: string | null, href: string): boolean {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
  
    return pathname === href || pathname.startsWith(`${href}/`);
  }