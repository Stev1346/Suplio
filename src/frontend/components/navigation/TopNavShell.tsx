"use client";

import { GuestDjProfileModalTrigger } from "@/contexts/GuestDjProfileModalContext";
import { useEventCode } from "@/contexts/GuestEventContext";
import { routes } from "@/lib/shared/constants/routes";
import { isActivePath } from "@/lib/shared/routing/isActivePath";
import {
  isDjPrivatePath,
  isGuestEventPath,
} from "@/lib/shared/routing/routeGroups";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavLink = {
  label: string;
  href: string;
};

export function TopNavShell() {
  const pathname = usePathname();
  const eventCode = useEventCode();
  const [openPath, setOpenPath] = useState<string | null>(null);

  const isOpen = openPath === pathname;

  if (isDjPrivatePath(pathname)) {
    return null;
  }

  const guestLinks: NavLink[] =
    eventCode && isGuestEventPath(pathname)
      ? [
          { label: "Scan", href: routes.guest.scan(eventCode) },
          { label: "Request", href: routes.guest.request(eventCode) },
          { label: "Vote", href: routes.guest.vote(eventCode) },
        ]
      : [];

  const desktopLinkClass = (href: string) =>
    `text-sm transition-colors hover:text-secondary-40 ${
      isActivePath(pathname, href)
        ? "font-semibold text-secondary-80"
        : "text-secondary-60"
    }`;

  return (
    <nav className="border-b text-secondary-80 border-muted-10 bg-muted-10 px-4 py-3">
      <div className="mx-auto flex items-center">
        <Link href={"/"} className="font-semibold tracking-tight">
          GotATune
        </Link>

        <button
          type="button"
          className="sm:hidden ml-auto rounded-md p-2 hover:bg-muted-20"
          onClick={() =>
            setOpenPath((prev) => (prev === pathname ? null : pathname))
          }
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-links"
        >
          <Menu />
        </button>
        <div className="hidden ml-auto items-center gap-4 sm:flex ">
          {guestLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={desktopLinkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
          {guestLinks.length > 0 && (
            <GuestDjProfileModalTrigger
              className="rounded-md px-2 py-1 text-sm hover:bg-muted-20"
              onClick={() => setOpenPath(null)}
            >
              Check out your DJ
            </GuestDjProfileModalTrigger>
          )}
          <Link
            href={routes.dj.entry}
            className={desktopLinkClass(routes.dj.entry)}
          >
            Are you a DJ?
          </Link>
        </div>
      </div>
      {isOpen && (
        <div
          id="mobile-nav-links"
          className="mt-3 flex flex-col gap-2 items-center border-t border-muted-10 pt-3 sm:hidden"
        >
          {guestLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2 py-1 text-sm hover:bg-muted-20"
              onClick={() => setOpenPath(null)}
            >
              {link.label}
            </Link>
          ))}
          {guestLinks.length > 0 && (
            <GuestDjProfileModalTrigger className={desktopLinkClass("#")}>
              Check out your DJ
            </GuestDjProfileModalTrigger>
          )}
          <Link
            href={routes.dj.entry}
            className="rounded-md px-2 py-1 text-sm font-medium hover:bg-muted-20"
            onClick={() => setOpenPath(null)}
          >
            Are you a DJ?
          </Link>
        </div>
      )}
    </nav>
  );
}
