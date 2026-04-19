import { DjPrivateNav } from "@/components/navigation/DjPrivateNav";
import { DjLastTabSignOut } from "@/features/dj/session/DjLastTabSignOut";
import React from "react";

export default function DjPrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DjLastTabSignOut />
      <DjPrivateNav />
      <main className="min-h-dvh bg-background pt-15">{children}</main>
    </>
  );
}
