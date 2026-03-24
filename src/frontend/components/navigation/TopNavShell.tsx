"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function TopNavShell() {
  const [open, setOpen] = useState(false);

  return (
    <nav className=" text-secondary-80 border border-muted-10 bg-muted-10 p-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold">GotATune</span>
        <button
          className="sm:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Open menu"
        >
          <Menu />
        </button>
        <div className="hidden gap-4 sm:flex ">
            <Link href="/dj" className="hover:text-secondary-60">DJ</Link>
            <Link href="/event/demo" className="hover:text-secondary-60">Guest</Link>
        </div>
      </div>
      {open && (
        <div className="mt-3 flex flex-col gap-2 sm:hidden">
            <Link href="/dj" className="hover:text-secondary-60">DJ</Link>
            <Link href="/event/demo" className="hover:text-secondary-60">Guest</Link>
        </div>
      )}
    </nav>
  );
}
