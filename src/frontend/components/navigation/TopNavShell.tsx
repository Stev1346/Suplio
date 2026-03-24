"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function TopNavShell() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const isOpen = openPath === pathname;

  return (
    <nav className=" text-secondary-80 border border-muted-10 bg-muted-10 p-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold">GotATune</span>
        <button
          type="button"
          className="sm:hidden"
          onClick={() =>
            setOpenPath((prev) => (prev === pathname ? null : pathname))
          }
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-links"
        >
          <Menu />
        </button>
        <div className="hidden gap-4 sm:flex ">
          <Link href="/dj" className="hover:text-secondary-60">
            DJ
          </Link>
          <Link href="/event/demo" className="hover:text-secondary-60">
            Guest
          </Link>
        </div>
      </div>
      {isOpen && (
        <div
          id="mobile-nav-links"
          className="mt-3 flex flex-col gap-2 sm:hidden"
        >
          <Link href="/dj" className="hover:text-secondary-60">
            DJ
          </Link>
          <Link href="/event/demo" className="hover:text-secondary-60">
            Guest
          </Link>
        </div>
      )}
    </nav>
  );
}
