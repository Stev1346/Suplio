"use client";

import { EventOver } from "@/components/EventOver";
import { NotFound } from "@/components/NotFound";
import { RequestCard } from "@/components/RequestCard";
import { StartingSoon } from "@/components/StartingSoon";
import { AppHeader } from "@/components/ui/AppHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageShell } from "@/components/ui/PageShell";
import { useEventCode } from "@/contexts/GuestEventContext";
import { useEvent } from "@/hooks/guest/useEventByCode";
import { useEventRequests } from "@/hooks/guest/useEventRequests";
import { useVoting } from "@/hooks/guest/useVoting";
import { compareRankedRequests } from "@/lib/request-ranking";
import {
  eventMode,
  lifecycleStatus,
  requestStatus,
  routes,
} from "@/lib/shared/constants/routes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { featureFlags } from "@/lib/shared/config/feature-flags";

export default function VoteScreen() {
  const eventCode = useEventCode();
  const router = useRouter();
  const {
    event,
    loading: eventLoading,
    error: eventError,
  } = useEvent(eventCode, { realtime: true });
  const {
    requests,
    refetch,
    loading: requestLoading,
    error: requestError,
  } = useEventRequests(
    event?.id,
    {
      statuses: [requestStatus.lower.accepted, requestStatus.lower.played],
      orderBy: "votes",
      ascending: false,
    },
    { realtime: true },
  );
  const { handleVote, votedRequestIds, votingRequestId } = useVoting(
    event?.id,
    eventCode,
    refetch,
  );
  const isLoading = !!eventCode && (eventLoading || requestLoading);
  const rankedRequests = [...requests].sort(compareRankedRequests);

  const [queueFilter, setQueueFilter] = useState<"all" | "active" | "played">(
    "active",
  );
  const visibleRequests = rankedRequests.filter((r) => {
    if (queueFilter === "active")
      return r.status === requestStatus.lower.accepted;
    if (queueFilter === "played")
      return r.status === requestStatus.lower.played;
    return true;
  });
  const topRequests = requests
    .filter(
      (r) =>
        r.status === requestStatus.lower.played ||
        r.status === requestStatus.lower.accepted,
    )
    .sort(compareRankedRequests)
    .slice(0, 10);

  useEffect(() => {
    if (!eventCode || !event) return;
    if (event.event_mode === eventMode.lower.karaoke) {
      router.replace(routes.guest.karaoke(eventCode));
    }
  }, [event, eventCode, router]);

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
        <p className="text-red-400 text-sm">{eventError}</p>
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
    <PageShell centralize className="flex-col items-center">
      <AppHeader
        title={event.name}
        tagLine="Vote for your favourite songs"
        event={event}
        eventCode={eventCode}
      />
      {(eventError || requestError) && (
        <p className="text-red-400 text-sm mb-2">
          {requestError ?? eventError}
        </p>
      )}
      <section className="flex-1 flex-col items-center justify-center">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold mb-3 text-muted-60">
            Song Request Queue
          </h2>
          {featureFlags.customEventDesigns && (
            <div
              className="flex rounded-md border border-secondary-60 p-0.5 text-sm"
              role="group"
              aria-label="Filter song queue"
            >
              {(
                [
                  { id: "all", label: "All" },
                  { id: "active", label: "Active" },
                  { id: "played", label: "Played" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={queueFilter === opt.id}
                  onClick={() => setQueueFilter(opt.id)}
                  className={`rounded px-2 py-1 transition-colors ${
                    queueFilter === opt.id
                      ? "bg-secondary-20 text-white"
                      : "text-muted-60 hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <ul className="space-y-1 lg:max-h-178 max-h-167 mb-2 overflow-scroll no-scrollbar">
          {visibleRequests.length === 0 ? (
            <li className="text-muted-40 py-4">
              {requests.length === 0
                ? "No requests yet. Be the first!"
                : "No songs match this filter."}
            </li>
          ) : (
            visibleRequests.map((r, i) => (
              <RequestCard
                key={r.id}
                request={r}
                rank={i + 1}
                showVoteButton={true}
                onVote={handleVote}
                voteLoading={votingRequestId === r.id}
                hasVoted={votedRequestIds.has(r.id)}
              />
            ))
          )}
        </ul>
      </section>
    </PageShell>
  );
}
