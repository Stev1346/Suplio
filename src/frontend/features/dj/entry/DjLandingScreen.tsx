"use client";

import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/ui/PageShell";
import { routes } from "@/lib/shared/constants/routes";
import Link from "next/link";

export default function DjLandingScreen() {

  return (
    <PageShell className="flex flex-col">
      <AppHeader title="DJs" />
      <div className="flex flex-col flex-1 gap-6 px-4">
        <p className="text-center max-w-md text-secondary-60">
          Log in to manage events, or create an account to get started.
        </p>
        <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
          <Button className="w-full sm:w-auto">
          <Link href={routes.dj.login}>
          Log in
          </Link>
          </Button>
          <Button variant={"secondary"} className="w-full sm:w-auto">
          <Link href={routes.dj.signup}>
          Create account 
          </Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
