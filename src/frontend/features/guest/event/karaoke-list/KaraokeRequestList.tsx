"use client";

import { EventOver } from "@/components/EventOver";
import { NotFound } from "@/components/NotFound";
import { StartingSoon } from "@/components/StartingSoon";
import { AppHeader } from "@/components/ui/AppHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageShell } from "@/components/ui/PageShell";
import { useEventCode } from "@/contexts/GuestEventContext";
import { useEvent } from "@/hooks/guest/useEventByCode";
import { useEventRequests } from "@/hooks/guest/useEventRequests";
import {
  eventMode,
  karaokeRequestStatus,
  lifecycleStatus,
  requestStatus,
  routes,
} from "@/lib/shared/constants/routes";
import { Database } from "@/types/database";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

function KaraokeSection({
  title,
  requests,
}: {
  title: string;
  requests: RequestRow[];
}) {
  return (
    <section className="w-full max-w-3xl rounded-lg border border-muted-20 bg-muted-10/30 p-4">
      <h2 className="mb-3 text-lg font-semibold text-muted-60">{title}</h2>
      {requests.length === 0 ? (
        <p className="text-sm text-muted-40">No requests yet.</p>
      ) : (
        <ul className="space-y-2">
          {requests.map((r) => (
            <li key={r.id} className="rounded-md border border-muted-20 p-3">
              <p className="font-medium text-secondary-80">{r.song_name}</p>
              <p className="text-sm text-muted-60">
                {r.artist ? `${r.artist}` : "Unknown artist"}
              </p>
              <p className="text-sm text-accent-80">
                Performer: {r.performer_name ?? "Uknown performer"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function KaraokeRequestListScreen() {
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
    { orderBy: "created_at", ascending: true },
    { realtime: true },
  );

  const isLoading = !!eventCode && (eventLoading || requestLoading);

  useEffect(() => {
    if (!eventCode || !event) return;
    if (event.event_mode !== eventMode.lower.karaoke) {
      router.replace(routes.guest.vote(eventCode));
    }
  }, [event, eventCode, router]);

  if (isLoading) {
    return (
      <PageShell centralize>
        <LoadingState />
      </PageShell>
    );
  }

  if (!eventCode || !event) return <NotFound variant="event" />;

  if (event.lifecycle_status === lifecycleStatus.lower.draft) {
    return <StartingSoon eventName={event.name} />;
  }

  const topRequests = requests
    .filter(
      (r) =>
        r.status === requestStatus.lower.played ||
        r.status === requestStatus.lower.accepted,
    )
    .slice(0, 10);

  if (
    event.lifecycle_status === lifecycleStatus.lower.ended ||
    event.lifecycle_status === lifecycleStatus.lower.archived
  ) {
    return <EventOver eventName={event.name} topRequests={topRequests} />;
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
  const remainingQueue = karaokeRequests.filter(
    (r) => r.status === karaokeRequestStatus.lower.queued,
  );

  return (
    <PageShell centralize className="flex-col">
      <AppHeader tagLine="Karaoke Request List" title={event.name} />
      {(eventError || requestError) && (
        <p className="mb-2 text-sm text-red-400">
          {requestError ?? eventError}
        </p>
      )}

      <div className="flex w-full flex-1 flex-col items-center gap-4">
        <KaraokeSection title="Performing now" requests={performingNow} />
        <KaraokeSection title="Up Next" requests={upNext} />
        <KaraokeSection title="Remaining Queue" requests={remainingQueue} />

        <div className="mt-2 flex flex-row gap-6">
          <Link
            href={routes.guest.eventLanding(eventCode)}
            className="mr-auto text-lg text-secondary-60 hover:text-secondary-40"
          >
            Share Event URL
          </Link>
          <Link
            href={routes.guest.request(eventCode)}
            className="ml-auto text-lg text-accent-80 hover:text-accent-60"
          >
            Submit another request
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
