import { NotFound } from "@/components/NotFound";
import { RequestCard } from "@/components/RequestCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { PageShell } from "@/components/ui/PageShell";
import { useEventCode } from "@/contexts/EventContext";
import { useEvent } from "@/hooks/useEvent";
import { useEventRequests } from "@/hooks/useEventRequests";
import { useVoting } from "@/hooks/useVoting";
import Link from "next/link";


export default function VoteScreen() {
  const eventCode = useEventCode();
  const {event, loading: eventLoading} = useEvent(eventCode);
  const {requests, refetch, loading: requestLoading} = useEventRequests(event?.id, {statuses: ["accepted", "pending"], orderBy: "votes", ascending: false});
  const {handleVote, votedRequestIds, votingRequestId } = useVoting(event?.id, eventCode, refetch);
  const isLoading = !!eventCode && (eventLoading || requestLoading);

  if (isLoading) {
    return (
      <PageShell narrow>
        <p className="text-muted-500">Loading...</p>
      </PageShell>
    );
  }

  if (!eventCode || !event) {
    return <NotFound narrow variant="event" />;
  }

  return (
    <PageShell narrow>
      <AppHeader tagLine="Vote for the next song" />
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
            requests.map((r, i) => (
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
        <Link
          href={`/event/${eventCode}/request`}
          className="text-md font-semibold text-tertiary-500 ml-auto"
        >
          <h2>Submit another request</h2>
        </Link>
      </section>
    </PageShell>
  );
}
