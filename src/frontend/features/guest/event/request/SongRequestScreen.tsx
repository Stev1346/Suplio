"use client";

import { EventOver } from "@/components/EventOver";
import { NotFound } from "@/components/NotFound";
import { StartingSoon } from "@/components/StartingSoon";
import { TopRequestList } from "@/components/TopRequestList";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageShell } from "@/components/ui/PageShell";
import { useEventCode } from "@/contexts/GuestEventContext";
import { useEvent } from "@/hooks/guest/useEventByCode";
import { useEventRequests } from "@/hooks/guest/useEventRequests";
import { useCooldownTimer } from "@/hooks/useCooldownTimer";
import { insertRequest } from "@/lib/client/api/requests";
import { compareRankedRequests } from "@/lib/request-ranking";
import {
  eventMode,
  karaokeRequestStatus,
  lifecycleStatus,
  requestStatus,
  routes,
} from "@/lib/shared/constants/routes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { KaraokeQueuePreview } from "./KaraokeQueuePreview";

export default function SongRequestScreen() {
  const eventCode = useEventCode();
  const router = useRouter();
  const {
    event,
    loading: eventLoading,
    error: eventError,
  } = useEvent(eventCode, { realtime: true });
  const {
    requests,
    loading: requestLoading,
    error: requestError,
  } = useEventRequests(
    event?.id,
    {
      orderBy:
        event?.event_mode === eventMode.lower.karaoke
          ? "created_at"
          : "song_name",
      ascending: true,
    },
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
  const [submitLoading, setSubmitLoading] = useState(false);
  const [songName, setSongName] = useState("");
  const [artist, setArtist] = useState("");
  const [message, setMessage] = useState("");
  const [performerName, setPerformerName] = useState("");
  const CLIENT_REQUEST_COOLDOWN_SEC = 60;
  const cooldownKey = eventCode
    ? `suplio:request-cooldown:${eventCode}`
    : "suplio:request-cooldown:pending";
  const { isCoolingDown, secondsLeft, startCooldown } =
    useCooldownTimer(cooldownKey);

  const isLoading = !!eventCode && (requestLoading || eventLoading);
  const isEventLive = event?.lifecycle_status === lifecycleStatus.lower.live;
  const isRequestEnabled = isEventLive ? event?.allow_requests : false;
  const isKaraokeMode = event?.event_mode === "karaoke";

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!event?.allow_requests || !event.id) return;
    if (!eventCode) return;
    if (isCoolingDown) return;

    const song = songName.trim();
    const artistValue = artist.trim();
    const performer = performerName.trim();

    if (!song) {
      toast.error("Song name is required");
      return;
    }

    if (isKaraokeMode) {
      if (!performer) {
        toast.error("Performer name is required");
        return;
      }
      if (!artistValue) {
        toast.error("Artist name is required");
        return;
      }
    }

    setSubmitLoading(true);

    const { error, retryAfterSec } = await insertRequest(eventCode, {
      song_name: songName.trim(),
      artist: artist.trim() || null,
      message: message.trim() || null,
      request_type: isKaraokeMode ? "karaoke" : "song_request",
      performer_name: isKaraokeMode ? performer : null,
    });

    setSubmitLoading(false);

    if (retryAfterSec) {
      startCooldown(retryAfterSec);
      toast.error("Please wait before submitting another request.");
      return;
    }

    if (error) {
      toast.error(error);
      return;
    }

    startCooldown(CLIENT_REQUEST_COOLDOWN_SEC);

    if (isKaraokeMode) {
      router.push(routes.guest.karaoke(eventCode));
      return;
    }

    router.push(routes.guest.vote(eventCode));
  }

  const karaokeRequests = requests.filter(
    (r) => r.request_type === eventMode.lower.karaoke,
  );
  const performingNow = karaokeRequests.filter(
    (r) => r.status === karaokeRequestStatus.lower.performingNow,
  );
  const upNext = karaokeRequests.filter(
    (r) => r.status === karaokeRequestStatus.lower.upNext,
  );
  const queued = karaokeRequests.filter(
    (r) => r.status === karaokeRequestStatus.lower.queued,
  );

  if (isLoading) {
    return (
      <PageShell centralize>
        <LoadingState />
      </PageShell>
    );
  }

  if (!eventCode) {
    return <NotFound variant="event" />;
  }

  if (!event && eventError) {
    return (
      <PageShell centralize>
        <p className="text-red-400">{eventError}</p>
      </PageShell>
    );
  }

  if (!event) {
    return <NotFound variant="event" />;
  }

  if (event.lifecycle_status === lifecycleStatus.lower.draft) {
    return <StartingSoon eventName={event.name} />;
  }

  if (
    event.lifecycle_status === lifecycleStatus.lower.ended ||
    event.lifecycle_status === lifecycleStatus.lower.archived
  ) {
    return <EventOver eventName={event.name} topRequests={topRequests} />;
  }

  return (
    <PageShell centralize className="flex-col">
      <AppHeader
        title={event.name}
        tagLine="Request a song"
        event={event}
        eventCode={eventCode}
      />
      {(eventError || requestError) && (
        <p className="text-red-400 text-sm mb-2">
          {requestError ?? eventError}
        </p>
      )}
      <div className="flex-1 flex-col items-center max-w-sm w-full">
        {!isRequestEnabled ? (
          <h1 className="text-accent-60 text-3xl text-center mb-4">
            Requests are paused for {event.name}.
          </h1>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-sm w-full mb-6">
            {isCoolingDown && (
              <p
                role="status"
                aria-live="polite"
                className="flex flex-row justify-center gap-2 rounded-md border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100"
              >
                The DJ is cooking. Your next request will be available in{" "}
                <span className="font-semibold tabular-nums">
                  {secondsLeft}s
                </span>
              </p>
            )}
            {isKaraokeMode ? (
              <FormField
                label="Performer name"
                required
                value={performerName}
                onChange={(e) => setPerformerName(e.target.value)}
              />
            ) : null}
            <FormField
              label="Song name"
              required
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
            />
            <FormField
              label="Artist"
              optional={!isKaraokeMode}
              required={isKaraokeMode}
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
            {isKaraokeMode ? null : (
              <FormField
                label="Message for DJ"
                optional
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            )}
            <Button
              type="submit"
              disabled={submitLoading || isCoolingDown}
              className="w-full"
            >
              {submitLoading
                ? "Submitting..."
                : isCoolingDown
                  ? `Wait ${secondsLeft}s`
                  : "Request song"}
            </Button>
          </form>
        )}
        {isKaraokeMode ? (
          <KaraokeQueuePreview
            performingNow={performingNow}
            upNext={upNext}
            queued={queued}
          />
        ) : (
          <TopRequestList
            requests={topRequests}
            title="Top requested tonight"
            className="mb-4 max-h-80 overflow-scroll no-scrollbar"
          />
        )}
      </div>
    </PageShell>
  );
}
