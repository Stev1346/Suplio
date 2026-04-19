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
import { lifecycleStatus, requestStatus } from "@/lib/shared/constants/routes";
import Link from "next/link";

export default function VoteScreen() {
  const eventCode = useEventCode();
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
  const topRequests = requests
    .filter(
      (r) =>
        r.status === requestStatus.lower.played ||
        r.status === requestStatus.lower.accepted,
    )
    .sort(compareRankedRequests)
    .slice(0, 10);

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
      <AppHeader tagLine="Vote for your favourite songs" />
      {(eventError || requestError) && (
        <p className="text-red-400 text-sm mb-2">
          {requestError ?? eventError}
        </p>
      )}
      <section className="flex-1 flex-col items-center justify-center">
        <h2 className="text-lg font-semibold mb-3 text-muted-60">
          Song Request Queue
        </h2>
        <ul className="space-y-1 lg:max-h-178 max-h-167 mb-2 overflow-scroll no-scrollbar">
          {requests.length === 0 ? (
            <li className="text-muted-40 py-4">
              No requests yet. Be the first!
            </li>
          ) : (
            rankedRequests.map((r, i) => (
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
        <div className="flex flex-row gap-6">
          <Link
            href={`/event/${eventCode}`}
            className="text-secondary-60 text-lg hover:text-secondary-40 mr-auto"
          >
            Share Event URL
          </Link>
          <Link
            href={`/event/${eventCode}/request`}
            className="text-lg text-accent-80 hover:text-accent-60 ml-auto"
          >
            <h2>Submit another request</h2>
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
