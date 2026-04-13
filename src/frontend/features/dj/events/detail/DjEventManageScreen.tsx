"use client";

import { FullRequestList } from "@/components/FullRequestList";
import { NotFound } from "@/components/NotFound";
import { TopRequestList } from "@/components/TopRequestList";
import { AllowRequestsSwitch } from "@/components/ui/AllowRequestsSwitch";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageShell } from "@/components/ui/PageShell";
import { useEvent } from "@/hooks/guest/useEventByCode";
import { useEventRequests } from "@/hooks/guest/useEventRequests";
import {
  patchEventAllowRequests,
  patchRequestStatus,
} from "@/lib/client/api/dj";
import { compareRankedRequests } from "@/lib/request-ranking";
import { EventStatus } from "@/types/database";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { requestStatus, routes } from "@/lib/shared/constants/routes";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

function eventSlugFromParams(
  raw: string | string[] | undefined,
): string | undefined {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && raw[0]) return raw[0];
  return undefined;
}

export default function DjEventManageScreen() {
  const params = useParams();
  const eventCode = eventSlugFromParams(params.eventId);
  const {
    event,
    setEvent,
    loading: eventLoading,
    error: eventError,
  } = useEvent(eventCode, { realtime: true });
  const STATUS_OPTIONS: EventStatus[] = [
    requestStatus.lower.pending,
    requestStatus.lower.accepted,
    requestStatus.lower.rejected,
    requestStatus.lower.played,
  ];
  const [selectedStatuses, setSelectedStatuses] = useState<Set<EventStatus>>(
    new Set(),
  );
  const {
    requests,
    setRequests,
    loading: requestsLoading,
    error: requestError,
  } = useEventRequests(
    event?.id,
    { orderBy: "song_name", ascending: true },
    { realtime: true },
  );
  const [togglingAllow, setTogglingAllow] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const topRequested = requests
    .filter(
      (r) =>
        r.status === requestStatus.lower.played ||
        r.status === requestStatus.lower.accepted,
    )
    .sort(compareRankedRequests)
    .slice(0, 10);
  const filteredRequests = useMemo(() => {
    if (selectedStatuses.size === 0) return requests;
    return requests.filter((r) => selectedStatuses.has(r.status));
  }, [requests, selectedStatuses]);
  const isLoading = !!eventCode && (eventLoading || requestsLoading);
  const statusCounts = useMemo<Record<EventStatus, number>>(
    () =>
      requests.reduce(
        (acc, r) => {
          acc[r.status] += 1;
          return acc;
        },
        { pending: 0, accepted: 0, rejected: 0, played: 0 },
      ),
    [requests],
  );
  const totalCount = requests.length;

  async function handleToggleAllowRequests() {
    if (!event || togglingAllow) return;

    setTogglingAllow(true);
    const allowRequests = !event.allow_requests;
    const { error } = await patchEventAllowRequests(event.id, allowRequests);
    setTogglingAllow(false);

    if (!error) {
      setEvent((prev) =>
        prev ? { ...prev, allow_requests: allowRequests } : prev,
      );
    } else {
      toast.error("Could not update setting. Try again");
    }
  }

  async function setRequestStatus(requestId: string, status: EventStatus) {
    if (!event || updatingId) return;

    setUpdatingId(requestId);
    const { error } = await patchRequestStatus(requestId, status);
    setUpdatingId(null);

    if (!error) {
      setRequests((prev) =>
        prev
          ? prev.map((r) => (r.id === requestId ? { ...r, status } : r))
          : prev,
      );
    } else {
      toast.error(error ?? "Could not update request status. Try again.");
    }
  }

  function toggleStatus(status: EventStatus) {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  function clearFilters() {
    setSelectedStatuses(new Set());
  }

  if (isLoading) {
    return (
      <PageShell centralize>
        <LoadingSpinner />
      </PageShell>
    );
  }

  if (!eventCode || !event) {
    return <NotFound variant="event" />;
  }

  return (
    <PageShell className="flex flex-col">
      <header className="mb-8 flex flex-col justify-center items-center">
        <h1 className="text-muted-60 text-3xl">{event.name}</h1>
        <Link  href={routes.guest.eventLanding(eventCode)} target="_blank" className="text-accent-80 text-lg hover:underline">Event code: {eventCode}</Link>
        <p className="text-muted-80 text-sm mt-1">
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
      {(eventError || requestError) && (
        <p className="text-red-400 text-sm mb-2">
          {requestError ?? eventError}
        </p>
      )}
      <div className="flex gap-6 justify-center flex-1 sm:flex-col">
        <section className="mb-8 w-2xl max-h-150 overflow-scroll no-scrollbar">
          <TopRequestList title="Top Requested Songs" requests={topRequested} />
        </section>

        <section className="mb-8 w-2xl">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold mb-3 mr-auto text-muted-60">
                Request List ({filteredRequests.length}/{totalCount})
              </h2>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {STATUS_OPTIONS.map((status) => {
                  const active = selectedStatuses.has(status);
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => toggleStatus(status)}
                      className={`px-3 py-1 rounded text-sm font-medium transition 
                    ${active ? "bg-muted-60 text-primary-90" : "bg-primary-40 text-white hover:bg-primary-60"}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        <span className="capitalize">{status}</span>
                        <span className="text-xs opacity-80">
                          ({statusCounts[status]})
                        </span>
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={selectedStatuses.size === 0}
                  className="px-3 py-1 rounded text-sm font-medium bg-secondary-20 text-white disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
              <FullRequestList
                requests={filteredRequests}
                hiddenTitle={true}
                onSetStatus={setRequestStatus}
                updatingId={updatingId}
                className="max-h-121 overflow-scroll no-scrollbar"
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </PageShell>
  );
}
