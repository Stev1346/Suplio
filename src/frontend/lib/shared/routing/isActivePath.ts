import { routes } from "../constants/routes";

export function isActivePath(pathname: string | null, href: string): boolean {
    if (!pathname) return false;
    if (href === "/") return pathname === routes.home;
  
    return pathname === href || pathname.startsWith(`${href}/`);
  }