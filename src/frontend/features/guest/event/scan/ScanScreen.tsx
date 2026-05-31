"use client";

import { EventOver } from "@/components/EventOver";
import { NotFound } from "@/components/NotFound";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageShell } from "@/components/ui/PageShell";
import { useGuestDjProfileModal } from "@/contexts/GuestDjProfileModalContext";
import { useEventCode } from "@/contexts/GuestEventContext";
import { useEvent } from "@/hooks/guest/useEventByCode";
import { useEventRequests } from "@/hooks/guest/useEventRequests";
import { downloadEventQrPng } from "@/lib/client/download-event-qr-png";
import { compareRankedRequests } from "@/lib/request-ranking";
import { featureFlags } from "@/lib/shared/config/feature-flags";
import { lifecycleStatus, requestStatus } from "@/lib/shared/constants/routes";
import Link from "next/link";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import toast from "react-hot-toast";

export default function ScanScreen() {
  const eventCode = useEventCode();
  const {
    event,
    loading: eventLoading,
    error: eventError,
  } = useEvent(eventCode, { realtime: true });
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const requestUrl = eventCode ? `${baseUrl}/event/${eventCode}/request` : "";
  const exportQrRef = useRef<HTMLDivElement>(null);

  const { open } = useGuestDjProfileModal();
  const {
    requests,
    loading: requestLoading,
    error: requestError,
  } = useEventRequests(
    event?.id,
    { orderBy: "votes", ascending: false },
    { realtime: true },
  );
  const topRequests = requests
    .filter(
      (r) =>
        r.status === requestStatus.lower.played ||
        r.status === requestStatus.lower.accepted,
    )
    .sort(compareRankedRequests)
    .slice(0, 10);

  async function handleCopyUrl() {
    if (!requestUrl) return;

    try {
      await navigator.clipboard.writeText(requestUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link.");
    }
  }

  function handleDownloadQr() {
    if (!eventCode || !requestUrl) return;

    const canvas = exportQrRef.current?.querySelector("canvas");
    if (!canvas) {
      toast.error("Could not prepare QR for download");
      return;
    }
    try {
      downloadEventQrPng(canvas, eventCode);
      toast.success("QR downloaded.");
    } catch {
      toast.error("Could not download QR.");
    }
  }

  if (eventCode && (eventLoading || requestLoading)) {
    return (
      <PageShell centralize>
        <LoadingState />
      </PageShell>
    );
  }

  if (!eventCode || !event) {
    return <NotFound variant="event" />;
  }

  if (
    event.lifecycle_status === lifecycleStatus.lower.ended ||
    event.lifecycle_status === lifecycleStatus.lower.archived
  ) {
    return <EventOver eventName={event.name} topRequests={topRequests} />;
  }

  return (
    <PageShell className="flex flex-col items-center">
      <AppHeader tagLine="" title="" hideDjLink />
      {eventError && <p className="text-red-400 text-sm mb-3">{eventError}</p>}
      {requestError && (
        <p className="text-red-400 text-sm mb-3">{requestError}</p>
      )}

      <div className="flex-1 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2 text-center">
          Welcome to <br />
          {event.name}
        </h1>
        <Link
          href="#"
          className="text-lg text-(--guest-badge-accent) hover:underline"
          onClick={(e) => {
            e.preventDefault();
            open();
          }}
        >
          Meet your DJ
        </Link>
        <p className="text-muted-80 text-lg mb-2">Scan to request a song:</p>
        <div className="bg-white p-4 rounded-xl shadow mb-4">
          <QRCodeSVG value={requestUrl} size={220} level="M" />
        </div>
        {featureFlags.customEventDesigns && (
          <Button
            variant="secondary"
            onClick={handleDownloadQr}
            className="mb-4"
          >
            Download QR (PNG)
          </Button>
        )}
        <div ref={exportQrRef} className="sr-only" aria-hidden>
          <QRCodeCanvas
            value={requestUrl}
            size={960}
            level="M"
            bgColor="transparent"
            fgColor="#000000"
          />
        </div>
        <p className="text-muted-60 mb-2">Share this link with others:</p>
        <Button
          variant="secondary"
          onClick={handleCopyUrl}
          className="px-4 py-2 rounded break-all mb-6"
        >
          {requestUrl}
        </Button>
        <div className="flex gap-4">
          <Link href={`/event/${eventCode}/request`}>
            <Button>Request a song</Button>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
