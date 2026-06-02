"use client";

import { useGuestDjProfileModal } from "@/contexts/GuestDjProfileModalContext";
import { ScanQrPopup } from "@/features/guest/event/scan/ScanQrPopup";
import { EventState } from "@/hooks/guest/useEventByCode";
import Link from "next/link";
import { Button } from "./Button";
import { ListMusic, MicVocal, Music, ThumbsUp, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { eventMode, routes } from "@/lib/shared/constants/routes";

type AppHeaderProps = {
  title?: string;
  tagLine?: string;
  hideDjLink?: boolean;
  event?: NonNullable<EventState>;
  eventCode?: string;
};

export function AppHeader({
  title = "Suplio",
  tagLine = "Scan. Request. Vote.",
  hideDjLink = false,
  event,
  eventCode,
}: AppHeaderProps) {
  const { open } = useGuestDjProfileModal();
  const pathname = usePathname();

  const isKaraoke = event?.event_mode === eventMode.lower.karaoke;
  const isRequestPage = pathname?.endsWith("/request");
  const toggle =
    event && eventCode
      ? isRequestPage
        ? {
            href: isKaraoke
              ? routes.guest.karaoke(eventCode)
              : routes.guest.vote(eventCode),
            label: isKaraoke ? "Queue" : "Vote",
            Icon: isKaraoke ? ListMusic : ThumbsUp,
          }
        : {
            href: routes.guest.request(eventCode),
            label: "Request",
            Icon: isKaraoke ? MicVocal : Music,
          }
      : null;

  return (
    <header className="mb-6 space-y-1 text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="text-muted-40">{tagLine}</p>
      <p className="text-muted-80 text-xs">
        Remember, requests are suggestions not demands
      </p>
      <div className="flex mt-6 flex-row items-center justify-center gap-3">
        {!hideDjLink && (
          <Button
            variant={"secondary"}
            size={"sm"}
            onClick={() => open()}
            className="rounded-full"
          >
            <User />
          </Button>
        )}
        {toggle && (
          <Button
            asChild
            variant={"secondary"}
            size={"sm"}
            className="rounded-full bg-background shadow-lg"
            aria-label={`Go to ${toggle.label}`}
          >
            <Link href={toggle.href}>
              <toggle.Icon />
            </Link>
          </Button>
        )}
        {event && eventCode && (
          <ScanQrPopup event={event} eventCode={eventCode} />
        )}
      </div>
    </header>
  );
}
