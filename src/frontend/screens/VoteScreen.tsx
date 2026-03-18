import { NotFound } from "@/components/NotFound";
import { RequestCard } from "@/components/RequestCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageShell } from "@/components/ui/PageShell";
import { useEventCode } from "@/contexts/EventContext";
import { useEvent } from "@/hooks/useEvent";
import { useEventRequests } from "@/hooks/useEventRequests";
import { useVoting } from "@/hooks/useVoting";
import { compareRankedRequests } from "@/lib/request-ranking";
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
    { statuses: ["accepted", "pending"], orderBy: "votes", ascending: false },
    { realtime: true },
  );
  const { handleVote, votedRequestIds, votingRequestId } = useVoting(
    event?.id,
    eventCode,
    refetch,
  );
  const isLoading = !!eventCode && (eventLoading || requestLoading);
  const rankedRequests = [...requests].sort(compareRankedRequests);

  if (isLoading) {
    return (
      <PageShell narrow centralize>
        <LoadingSpinner />
      </PageShell>
    );
  }

  if (!eventCode || !event) {
    return <NotFound narrow variant="event" />;
  }

  return (
    <PageShell narrow>
      <AppHeader tagLine="Vote for the next song" />
      {(eventError || requestError) && (
        <p className="text-red-400 text-sm mb-2">
          {requestError ?? eventError}
        </p>
      )}
      <section className="">
        <h2 className="text-lg font-semibold mb-3 text-muted-500">
          Songs Requested Tonight
        </h2>
        <ul className="space-y-1 max-h-177 mb-2 overflow-scroll no-scrollbar">
          {requests.length === 0 ? (
            <li className="text-muted-500 py-4">
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
        <div className="flex flex-row">
          <Link
            href={`/event/${eventCode}`}
            className="text-secondary-700 text-lg hover:text-secondary-500 mr-auto"
          >
            Share Event URL
          </Link>
          <Link
            href={`/event/${eventCode}/request`}
            className="text-lg text-tertiary-500 hover:text-tertiary-300 ml-auto"
          >
            <h2>Submit another request</h2>
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
