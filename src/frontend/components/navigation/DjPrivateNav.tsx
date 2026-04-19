"use client";

import { routes } from "@/lib/shared/constants/routes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { useEffect, useState } from "react";
import { Menu, Plus } from "lucide-react";
import { isActivePath } from "@/lib/shared/routing/isActivePath";
import { DjEventSearch } from "./DjEventSearch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

type DjNavLink = {
  label: string;
  href: string;
};

export function DjPrivateNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  async function handleLogOut() {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      await fetch("/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });
      router.push(routes.dj.login);
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const navLinks: DjNavLink[] = [
    { label: "Dashboard", href: routes.dj.dashboard },
    { label: "My Events", href: routes.dj.events },
    { label: "Profile", href: routes.dj.profile },
    { label: "Create Event", href: `${routes.dj.dashboard}#create-event` },
  ];

  const linkClass = (href: string) =>
    `text-sm transition-colors hover:text-secondary-40 ${
      isActivePath(pathname, href)
        ? "font-semibold text-secondary-80"
        : "text-secondary-60"
    }`;
  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <header
        className="fixed inset-x-0 top-0 z-50 border-b border-muted-20 bg-muted-20 
      px-4 py-3 text-secondary-80 backdrop-blur supports-backdrop-filter:bg-muted-20/50"
      >
        <div className="mx-auto flex flex-wrap items-center justify-between gap-3">
          <Link
            href={routes.dj.dashboard}
            className="font-semibold tracking-tight"
          >
            GotATune
          </Link>
          <button
            type="button"
            className="rounded-md p-2 hover:bg-muted-20 sm:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open DJ menu"
            aria-expanded={mobileNavOpen}
            aria-controls="dj-mobile-nav-sheet"
          >
            <Menu />
          </button>

          <div className="hidden items-center gap-4 sm:flex">
            <nav className="flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={linkClass(link.href)}
                >
                  {link.label === "Create Event" ? (
                    <p className="flex flex-row items-center">
                      <Plus />
                      Create Event
                    </p>
                  ) : (
                    link.label
                  )}
                </Link>
              ))}
            </nav>

            <DjEventSearch
            className="w-71"
              inputClassName="w-full border-muted-10 focus:border-muted-90"
            />

            <Button
              type="button"
              variant={"secondary"}
              disabled={loggingOut}
              onClick={handleLogOut}
            >
              {loggingOut ? "Signing out..." : " Log out"}
            </Button>
          </div>
        </div>
      </header>
      <SheetContent
        id="dj-mobile-nav-sheet"
        side="right"
        className="w-full border-muted-10 bg-background text-secondary-80 sm:max-w-sm backdrop-blur supports-backdrop-filter:bg-muted-10/70"
      >
        <SheetHeader>
          <SheetTitle className="text-left text-secondary-80">
            DJ Menu
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navigation for DJs: dashboard, my events, my profile, create events
            or search events
          </SheetDescription>
        </SheetHeader>
        <div
          id="dj-mobile-nav-links"
          className="flex max-h-[calc(100dvh-8rem)] px-4 pb-6 flex-col gap-3 overflow-y-auto"
        >
          <nav
            className="flex flex-col gap-2"
            aria-label="DJ mobile navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-2 text-sm hover:bg-muted-20"
                onClick={() => setMobileNavOpen(false)}
              >
                {link.label === "Create Event" ? (
                  <p className="flex flex-row items-center">
                    Create Event{" "}
                    <Plus className="border border-secondary-40 ml-1.5 rounded-sm" />
                  </p>
                ) : (
                  link.label
                )}
              </Link>
            ))}
          </nav>

          <DjEventSearch
            key="dj-event-search-mobile"
            className="w-full min-w-0"
            inputClassName="w-full border-muted-10 focus:border-muted-90"
          />

          <Button
            type="button"
            variant="secondary"
            disabled={loggingOut}
            onClick={async () => {
              setMobileNavOpen(false);
              await handleLogOut();
            }}
          >
            {loggingOut ? "Signing out..." : "Log out"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
