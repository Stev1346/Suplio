"use client";

import { isGuestEventPath } from "@/lib/shared/routing/routeGroups";
import { usePathname } from "next/navigation";
import { useCallback, useSyncExternalStore } from "react";
import { Button } from "../ui/Button";
import {
    emitDismissalChange,
  readDismissedFromStorage,
  STORAGE_KEY,
  subscribe,
} from "@/lib/shared/utils/cookie-management";

export function GuestCookieInformationBanner() {
  const pathname = usePathname();
  const dismissed = useSyncExternalStore(
    subscribe,
    readDismissedFromStorage,
    () => false,
  );
  const onDismiss = useCallback(() => {
    try{
        window.localStorage.setItem(STORAGE_KEY, "1");
    }
    catch{
        //ignore
    }
    emitDismissalChange();
  }, [])


  if (dismissed || !isGuestEventPath(pathname)) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="How we use cookies for guests"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-muted-20 bg-muted-10 px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm text-muted-60 leading-relaxed">
          This website uses a single first-party, essential cookie so your song
          requests and votes stay tied to this browser session. It is NOT used
          for ads or tracking across sites.
        </p>
        <Button
          type="button"
          variant={"secondary"}
          size={"sm"}
          className="shrink-0 self-end sm:self-center"
          onClick={onDismiss}
        >
          Noted
        </Button>
      </div>
    </div>
  );
}
