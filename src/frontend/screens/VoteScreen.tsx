import { NotFound } from "@/components/NotFound";
import { RequestCard } from "@/components/RequestCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/ui/PageShell";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const VOTED_STORAGE_KEY = "gotatune_voted";

type VoteMap = Record<string, string>;

function getVoteMap(eventCode: string): VoteMap {
  if (typeof window === "undefined") return {};

  try {
    const key = `${VOTED_STORAGE_KEY}_${eventCode}`;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as VoteMap) : {};
  } catch {
    return {};
  }
}

function getVotedRequestIds(eventCode: string): Set<string> {
  return new Set(Object.keys(getVoteMap(eventCode)));
}

function setVote(eventCode: string, requestId: string, voteId: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = `${VOTED_STORAGE_KEY}_${eventCode}`;
    const map = getVoteMap(eventCode);
    map[requestId] = voteId;
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    //ignore
  }
}

function removeVote(eventCode: string, requestId: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = `${VOTED_STORAGE_KEY}_${eventCode}`;
    const map = getVoteMap(eventCode);
    delete map[requestId];
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    //ignore
  }
}

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

type Props = { eventCode?: string };

export default function VoteScreen({ eventCode }: Props) {
  const [event, setEvent] = useState<{ id: string } | null>(null);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [votingRequestId, setVotingRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isLoading = !!eventCode && loading;
  const [votedRequestIds, setVotedRequestIds] = useState<Set<string>>(() =>
    eventCode ? getVotedRequestIds(eventCode) : new Set(),
  );

  useEffect(() => {
    if (!eventCode) {
      return;
    }

    async function load() {
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("id")
        .eq("event_code", eventCode)
        .single();

      if (eventError || !eventData) {
        setLoading(false);
        return;
      }
      setEvent(eventData);
      if (eventCode) setVotedRequestIds(getVotedRequestIds(eventCode));

      const { data: requestData } = await supabase
        .from("requests")
        .select("*")
        .eq("event_id", eventData.id)
        .in("status", ["pending", "accepted"])
        .order("votes", { ascending: false });

      setRequests(requestData ?? []);

      try{
        const res = await fetch(`/api/my-votes?event_id=${encodeURIComponent(eventData.id)}`);
        if(res.ok){
          const{votes} = await res.json();
          if(Array.isArray(votes) && votes.length > 0 && eventCode){
            const nextVoted = new Set<string>();
            for(const v of votes){
              if(v?.request_id && v?.id){
                nextVoted.add(v.request_id);
                setVote(eventCode, v.request_id, v.id);
              }
            }
            setVotedRequestIds(nextVoted);
          }
        }
      } catch{
        //ignore
      }
      setLoading(false);
    }
    load();
  }, [eventCode]);

  async function loadRequests(eventId: string) {
    const { data } = await supabase
      .from("requests")
      .select("*")
      .eq("event_id", eventId)
      .in("status", ["pending", "accepted"])
      .order("votes", { ascending: false });

    setRequests(data ?? []);
  }

  async function handleVote(requestId: string) {
    if (!event?.id || !eventCode) return;

    const isRemoving = votedRequestIds.has(requestId);
    setVotingRequestId(requestId);

    let res: Response;
    try {
      res = await fetch("/api/cast-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: requestId,
          action: isRemoving ? "remove" : "add",
        }),
      });
    } catch {
      setVotingRequestId(null);
      toast.error("Failed to get vote info");
      return;
    }

    setVotingRequestId(null);
    const data = await res.json().catch(() => ({}));
    const err = data?.error;

    if (!res.ok && res.status !== 409) {
      toast.error(err ?? "Failed to get vote info");
      return;
    }

    if(res.status === 409 && data?.data?.id){
      setVote(eventCode, requestId, data.data.id);
      setVotedRequestIds((prev) => new Set(prev).add(requestId));
      await loadRequests(event.id);
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
    } else {
      const id = data?.data?.id;
      if (id) {
        setVote(eventCode, requestId, id);
        setVotedRequestIds((prev) => new Set(prev).add(requestId));
      }
    }

    await loadRequests(event.id);
  }

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
