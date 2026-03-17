import { FullRequestList } from "@/components/FullRequestList";
import { NotFound } from "@/components/NotFound";
import { TopRequestList } from "@/components/TopRequestList";
import { AllowRequestsSwitch } from "@/components/ui/AllowRequestsSwitch";
import { AppHeader } from "@/components/ui/AppHeader";
import { PageShell } from "@/components/ui/PageShell";
import { useEventCode } from "@/contexts/EventContext";
import { useEvent } from "@/hooks/useEvent";
import { useEventRequests } from "@/hooks/useEventRequests";
import { updateEventAllowRequests } from "@/lib/events";
import { updateRequestStatus } from "@/lib/requests";
import { Database, EventStatus } from "@/types/database";
import { useState } from "react";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

export default function DashboardScreen() {
  const eventCode = useEventCode();
  const { event, setEvent, loading: eventLoading } = useEvent(eventCode);
  const {
    requests,
    setRequests,
    loading: requestsLoading,
  } = useEventRequests(
    event?.id,
    { orderBy: "song_name", ascending: true },
    { realtime: true },
  );
  const [togglingAllow, setTogglingAllow] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const topRequested = requests
    .filter((r) => r.status === "pending" || r.status === "accepted")
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 10);
  const isLoading = !!eventCode && (eventLoading || requestsLoading);

  async function handleToggleAllowRequests() {
    if (!event || togglingAllow) return;

    setTogglingAllow(true);
    const allowRequests = !event.allow_requests;
    const { error } = await updateEventAllowRequests(event.id, allowRequests);
    setTogglingAllow(false);

    if (!error)
      setEvent((prev) =>
        prev ? { ...prev, allow_requests: allowRequests } : prev,
      );
  }

  async function setRequestStatus(requestId: string, status: EventStatus) {
    if (!event || updatingId) return;

    setUpdatingId(requestId);
    const { error } = await updateRequestStatus(requestId, status);
    setUpdatingId(null);

    if (!error) {
      setRequests((prev: RequestRow[]) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r)),
      );
    }
  }

  if (isLoading) {
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
          <h2 className="text-lg font-semibold mb-3 text-muted-500">
            Request List
          </h2>
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
