import { RequestCard } from "@/components/RequestCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/ui/PageShell";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";
import { SearchX } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

type Props = { eventCode?: string };

export default function VoteScreen({ eventCode }: Props) {
  const [event, setEvent] = useState<{ id: string } | null>(null);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const isLoading = !!eventCode && loading;

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

      const { data: requestData } = await supabase
        .from("requests")
        .select("*")
        .eq("event_id", eventData.id)
        .in("status", ["pending", "accepted"])
        .order("votes", { ascending: false })
        .limit(10);

      setRequests(requestData ?? []);
      setLoading(false);
    }
    load();
  }, [eventCode]);

  if (isLoading) {
    return (
      <PageShell narrow>
        <p className="text-muted-500">Loading...</p>
      </PageShell>
    );
  }

  if (!eventCode || !event) {
    return (
      <PageShell narrow>
        <AppHeader tagLine="Event not found." />
        <p className="text-muted-500">
          <SearchX /> We could not find an event with that code.
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell narrow>
      <AppHeader tagLine="Vote for the next song" />
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-muted-500">
          Top requested songs
        </h2>
        <ul className="space-y-3">
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
                showVoteButton={false}
              />
            ))
          )}
        </ul>
      </section>
      <Link href={`/event/${eventCode}`}>
        <Button>Submit another request</Button>
      </Link>
    </PageShell>
  );
}
