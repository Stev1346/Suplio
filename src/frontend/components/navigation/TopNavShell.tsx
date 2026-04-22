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
import {  useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { cn } from "@/lib/utils";
import { useEvent } from "@/hooks/guest/useEventByCode";

type NavLink = {
  label: string;
  href: string;
};

export function TopNavShell() {
  const pathname = usePathname();
  const eventCode = useEventCode();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const guestEventCode = eventCode && isGuestEventPath(pathname) ? eventCode : undefined;
  const {event} = useEvent(guestEventCode);

  const thirdGuestLink = useMemo<NavLink | null>(() => {
    if(!guestEventCode) return null;

    if(event?.event_mode === "karaoke"){
      return{
        label: "Karaoke Queue",
        href: routes.guest.karaoke(guestEventCode)
      };
    }

    return{
      label: "Vote",
      href: routes.guest.vote(guestEventCode)
    };
  }, [event?.event_mode, guestEventCode]);

  if (isDjPrivatePath(pathname)) {
    return null;
  }

  const guestLinks: NavLink[] =
    eventCode && thirdGuestLink
      ? [
          { label: "Scan", href: routes.guest.scan(eventCode) },
          { label: "Request", href: routes.guest.request(eventCode) },
          thirdGuestLink,
        ]
      : [];

  const desktopLinkClass = (href: string) =>
    `text-sm transition-colors hover:text-secondary-40 ${
      isActivePath(pathname, href)
        ? "font-semibold text-secondary-80"
        : "text-secondary-60"
    }`;

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <nav
        className={cn("fixed inset-x-0 top-0 z-50 border-b border-muted-20 bg-muted-20", 
      "px-4 py-3 text-secondary-80 backdrop-blur supports-backdrop-filter:bg-muted-20/50")}
      >
        <div className="mx-auto flex items-center">
          <Link href={"/"} className="font-semibold tracking-tight">
            GotATune
          </Link>

          <button
            type="button"
            className="sm:hidden ml-auto rounded-md p-2 hover:bg-muted-20"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav-sheet"
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
                onClick={() => setMobileNavOpen(false)}
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
      </nav>
      <SheetContent
        id="mobile-nav-sheet"
        side="right"
        className="w-full border-muted-10 bg-background text-secondary-80 sm:max-w-sm backdrop-blur supports-backdrop-filter:bg-muted-10/70"
      >
        <SheetHeader>
          <SheetTitle className="text-left text-secondary-80">Menu</SheetTitle>
          <SheetDescription className="sr-only">
          Navigation for this event: scan, request, request list or vote,
          view your DJ&apos;s info, or go to the DJ access portal
          </SheetDescription>
        </SheetHeader>
        <nav
          aria-label="Mobile navigation"
          className="flex flex-col gap-2 items-stretch px-4 pb-6"
        >
          {guestLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2 py-2 text-sm hover:bg-muted-20"
              onClick={() => setMobileNavOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {guestLinks.length > 0 && (
            <GuestDjProfileModalTrigger
              className="rounded-md px-2 py-2 text-left text-sm hover:bg-muted-20"
              onClick={() => setMobileNavOpen(false)}
            >
              Check out your DJ
            </GuestDjProfileModalTrigger>
          )}
          <Link
            href={routes.dj.entry}
            className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted-20"
            onClick={() => setMobileNavOpen(false)}
          >
            Are you a DJ?
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
