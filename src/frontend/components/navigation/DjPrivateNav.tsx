"use client";

import { routes } from "@/lib/shared/constants/routes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { useState } from "react";

export function DjPrivateNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

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

  const linkClass = (href: string) =>
    `hover:text-secondary-60 ${pathname === href || pathname.startsWith(href + "/") ? "font-semibold" : ""}`;

  return (
    <header className="border-b border-muted-10 bg-muted-10 px-4 py-3">
      <div className="mx-auto flex max-w-51 flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link href={routes.dj.events} className={linkClass(routes.dj.events)}>
            My Events
          </Link>
          <Link
            href={routes.dj.profile}
            className={linkClass(routes.dj.profile)}
          >
            My Profile
          </Link>
        </nav>
        <Button
          type="button"
          variant={"secondary"}
          disabled={loggingOut}
          onClick={handleLogOut}
        >
          {loggingOut ? "Signing out..." : " Log out"}
        </Button>
      </div>
    </header>
  );
}
