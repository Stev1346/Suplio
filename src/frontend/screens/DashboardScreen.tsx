import { FullRequestList } from "@/components/FullRequestList";
import { NotFound } from "@/components/NotFound";
import { TopRequestList } from "@/components/TopRequestList";
import { AllowRequestsSwitch } from "@/components/ui/AllowRequestsSwitch";
import { AppHeader } from "@/components/ui/AppHeader";
import { PageShell } from "@/components/ui/PageShell";
import { supabase } from "@/lib/supabase";
import { Database, EventStatus } from "@/types/database";
import { useEffect, useState } from "react";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

type Props = { eventCode?: string };

const STATUS_LABELS: Record<EventStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  played: "Played",
};

export default function DashboardScreen({ eventCode }: Props) {
  const [event, setEvent] = useState<{
    id: string;
    name: string;
    allow_requests: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(() => !!eventCode);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [togglingAllow, setTogglingAllow] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const topRequested = requests
    .filter((r) => r.status === "pending" || r.status === "accepted")
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 10);

  const allRequested = requests.filter(
    (r) => r.status === "pending" || r.status === "accepted",
  );

  useEffect(() => {
    if (!eventCode) {
      return;
    }

    async function load() {
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("id, name, allow_requests")
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
        .order("song_name", { ascending: true });

      setRequests(requestData ?? []);
      setLoading(false);
    }
    load();
  }, [eventCode]);

  async function handleToggleAllowRequests() {
    if (!event || togglingAllow) return;

    setTogglingAllow(true);
    const allowRequest = !event.allow_requests;
    const { error } = await supabase
      .from("events")
      .update({ allow_requests: allowRequest })
      .eq("id", event.id);
    setTogglingAllow(false);

    if (!error)
      setEvent((e) => (e ? { ...e, allow_requests: allowRequest } : null));
  }

  async function setRequestStatus(requestId: string, status: EventStatus) {
    if (!event || updatingId) return;

    setUpdatingId(requestId);
    const { error } = await supabase
      .from("requests")
      .update({ status })
      .eq("id", requestId);
    setUpdatingId(null);

    if (!error) {
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r)),
      );
    }
  }

  if (eventCode && loading) {
    return (
      <PageShell>
        <p className="text-muted-500">Loading...</p>
      </PageShell>
    );
  }

  if (!eventCode || !event) {
    return <NotFound variant="event" />;
  }

  return (
    <PageShell className="flex flex-col">
      <AppHeader title="GotATune Dashboard" />
      <header className="mb-8 flex flex-col justify-center items-center">
        <h1 className="text-muted-500 text-3xl">{event.name}</h1>
        <p className="text-surface-300">Event code: {eventCode}</p>
        <p className="text-muted-700 text-sm mt-1">
          Total requests: {requests.length}
        </p>
        <div className="mt-4">
          <AllowRequestsSwitch
            checked={event.allow_requests}
            onToggle={handleToggleAllowRequests}
            disabled={togglingAllow}
          />
        </div>
      </header>
      <div className="flex gap-4 justify-center">
        <section className="mb-8 w-2xl mr-auto max-h-150 overflow-scroll no-scrollbar">
          <TopRequestList title="Top Requested Songs" requests={topRequested} />
        </section>
        <section className="mb-8 w-2xl ml-auto">
          <h2 className="text-lg font-semibold mb-3 text-muted-500">Request List</h2>
          <FullRequestList
            requests={requests}
            hiddenTitle={true}
            onSetStatus={setRequestStatus}
            updatingId={updatingId}
            className="max-h-121 overflow-scroll no-scrollbar"
          />
        </section>
      </div>
    </PageShell>
  );
}
