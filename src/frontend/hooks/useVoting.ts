import { removeVote, setVote } from "@/lib/vote-storage";
import { castVote, fetchMyVotes } from "@/lib/votes-api";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useVoting(
    eventId: string | undefined,
    eventCode: string | undefined,
    refetchRequests: () => Promise<void>
) {
    const [votedRequestIds, setVotedRequestIds] = useState<Set<string>>(() => new Set());
    const [votingRequestId, setVotingRequestId] = useState<string | null>(null);

    useEffect(() => {
        if (!eventId || !eventCode) return;

        fetchMyVotes(eventId).then((votes) => {
            if (votes.length === 0) return;

            const next = new Set<string>();
            votes.forEach((v) => {
                next.add(v.request_id);
                setVote(eventCode, v.request_id, v.id);
            });
            setVotedRequestIds(next);
        });
    }, [eventId, eventCode]);

    const handleVote = useCallback(
        async (requestId: string) => {
            if (!eventId || !eventCode) return;

            const isRemoving = votedRequestIds.has(requestId);
            setVotingRequestId(requestId);

            const res = await castVote(requestId, isRemoving ? "remove" : "add");
            setVotingRequestId(null);

            if (!res.ok && res.status !== 409) {
                toast.error(res.error ?? "Failed to get vote info");
                return;
            }

            if (res.status === 409 && res.data?.id) {
                setVote(eventCode, requestId, res.data.id);
                setVotedRequestIds((prev) => new Set(prev).add(requestId));
                await refetchRequests();
                toast.error("You've already voted for this")
                return;
            }

            if (isRemoving) {
                removeVote(eventCode, requestId);
                setVotedRequestIds((prev) => {
                    const next = new Set(prev);
                    next.delete(requestId);
                    return next;
                });
            } else if (res.data?.id) {
                setVote(eventCode, requestId, res.data.id);
                setVotedRequestIds((prev) => new Set(prev).add(requestId));
            }
            await refetchRequests();
        }, [eventId, eventCode, votedRequestIds, refetchRequests]);

    return { votedRequestIds, handleVote, votingRequestId };

}