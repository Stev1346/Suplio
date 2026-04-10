"use client";

import { routes } from "@/lib/shared/constants/routes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { useState } from "react";
import { Menu, Plus, Search } from "lucide-react";
import { Input } from "../ui/input";
import { isActivePath } from "@/lib/shared/routing/isActivePath";

type DjNavLink = {
  label: string;
  href: string;
};

export function DjPrivateNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);
  const [openPath, setOpenPath] = useState<string | null>(null);
  const isOpen = openPath === pathname;

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
    <header className="border-b border-muted-10 bg-muted-10 px-4 py-3 text-secondary-80">
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
          onClick={() =>
            setOpenPath((prev) => (prev === pathname ? null : pathname))
          }
          aria-label={isOpen ? "Close DJ menu" : "Open DJ menu"}
          aria-expanded={isOpen}
          aria-controls="dj-mobile-nav-links"
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
                    Create Event{" "}
                    <Plus className="border border-secondary-40 ml-1.5 rounded-sm" />
                  </p>
                ) : (
                  link.label
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center">
            <Input
              type="search"
              placeholder="Search events (coming soon)"
              aria-label="Search DJ events"
              className="w-56 border-muted-10 focus:border-muted-90"
            />
            <Button
              type="button"
              variant={"secondary"}
              className="border-none ml-0"
              disabled
            >
              <Search />
            </Button>
          </div>

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

        {isOpen && (
          <div
            id="dj-mobile-nav-links"
            className="flex mx-auto mt-3 flex-col items-center gap-2 border-t border-muted-10 pt-3 sm:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-1 text-sm hover:bg-muted-20"
                onClick={() => setOpenPath(null)}
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

            <div className="flex flex-row mt-1 w-full gap-2">
              <Input
                type="search"
                placeholder="Search events (coming soon)"
                aria-label="Search DJ events"
                className="border-muted-10 focus:border-muted-90"
              />
              <Button
                type="button"
                variant={"secondary"}
                className="border-none ml-0"
                disabled
              >
                <Search />
              </Button>
            </div>

            <Button
            type="button"
            variant="secondary"
            disabled={loggingOut}
            onClick={async () => {
              setOpenPath(null);
              await handleLogOut();
            }}
          >
            {loggingOut ? "Signing out..." : "Log out"}
          </Button>
          </div>
        )}
    </header>
  );
}

