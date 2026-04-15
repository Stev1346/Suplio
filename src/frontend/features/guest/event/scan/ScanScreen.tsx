"use client";

import { EventOver } from "@/components/EventOver";
import { NotFound } from "@/components/NotFound";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageShell } from "@/components/ui/PageShell";
import { useEventCode } from "@/contexts/GuestEventContext";
import { useEvent } from "@/hooks/guest/useEventByCode";
import { useEventRequests } from "@/hooks/guest/useEventRequests";
import { compareRankedRequests } from "@/lib/request-ranking";
import { lifecycleStatus, requestStatus } from "@/lib/shared/constants/routes";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
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

  const { requests, loading: requestLoading, error: requestError } = useEventRequests(
    event?.id,
    { orderBy: "votes", ascending: false },
    { realtime: true }
  );
  const topRequests = requests
  .filter(
    (r) =>
      r.status === requestStatus.lower.played ||
      r.status === requestStatus.lower.accepted
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

  if (eventCode && (eventLoading || requestLoading)) {
    return (
      <PageShell centralize>
        <LoadingSpinner />
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
      <AppHeader tagLine="Scan to request a song" />
      {eventError && <p className="text-red-400 text-sm mb-3">{eventError}</p>}
      {requestError && <p className="text-red-400 text-sm mb-3">{requestError}</p>}
      
      <div className="flex-1 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2 text-center">
          Welcome to <br />
          {event.name}
        </h1>
        <p className="text-muted-80 text-lg mb-2">Scan to request a song:</p>
        <div className="bg-white p-4 rounded-xl shadow mb-4">
          <QRCodeSVG value={requestUrl} size={220} level="M" />
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
