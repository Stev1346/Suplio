"use client";

import { FullRequestList } from "@/components/FullRequestList";
import { NotFound } from "@/components/NotFound";
import { TopRequestList } from "@/components/TopRequestList";
import { PageShell } from "@/components/ui/PageShell";
import { useEvent } from "@/hooks/guest/useEventByCode";
import { useEventRequests } from "@/hooks/guest/useEventRequests";
import {
  patchRequestStatus,
} from "@/lib/client/api/dj";
import { compareRankedRequests } from "@/lib/request-ranking";
import {
  RequestStatus,
  SongRequestStatus,
} from "@/types/database";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import {
  requestStatus,
  routes,
} from "@/lib/shared/constants/routes";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { LoadingState } from "@/components/ui/LoadingState";
import { DjEventControlsCard } from "../components/DjEventControlsCard";
import { FilterX } from "lucide-react";

function eventCodeFromParams(
  raw: string | string[] | undefined,
): string | undefined {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && raw[0]) return raw[0];
  return undefined;
}

export default function DjEventManageScreen() {
  const params = useParams();
  // Route param is eventCode for DJ page URL.
  // UUID event.id is resolved after fetch and then used for API PATCH calls.
  const eventCode = eventCodeFromParams(params.eventCode);
  const {
    event,
    setEvent,
    loading: eventLoading,
    error: eventError,
    refetch: refetchEvent,
  } = useEvent(eventCode, { realtime: true });
  const STATUS_OPTIONS: SongRequestStatus[] = [
    requestStatus.lower.pending,
    requestStatus.lower.accepted,
    requestStatus.lower.rejected,
    requestStatus.lower.played,
  ];
  const [selectedStatuses, setSelectedStatuses] = useState<Set<RequestStatus>>(
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
  const statusCounts = useMemo<Record<RequestStatus, number>>(
    () =>
      requests.reduce(
        (acc, r) => {
          acc[r.status] += 1;
          return acc;
        },
        {
          pending: 0,
          accepted: 0,
          rejected: 0,
          played: 0,
          queued: 0,
          performing_now: 0,
          up_next: 0,
        },
      ),
    [requests],
  );
  const totalCount = requests.length;

  async function setRequestStatus(
    requestId: string,
    status: SongRequestStatus,
  ) {
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

  function toggleStatus(status: SongRequestStatus) {
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
        <LoadingState />
      </PageShell>
    );
  }

  if (!eventCode || !event) {
    return <NotFound variant="event" />;
  }

  return (
    <PageShell className="flex flex-col">
      <header className="mb-3 flex flex-col justify-center items-center">
        <h1 className="text-muted-60 text-3xl">{event.name}</h1>
        {event.event_date && (
          <p className="text-lg text-secondary-70">Event Date: {event.event_date}</p>
        )}
        <Link
          href={routes.guest.eventLanding(eventCode)}
          target="_blank"
          className="text-accent-80 text-md hover:underline"
        >
          Event code: {eventCode}
        </Link>
      </header>
      {(eventError || requestError) && (
        <p className="mb-2 text-sm text-red-400">
          {requestError ?? eventError}
        </p>
      )}

      <div className="flex flex-row justify-between gap-6">
        <DjEventControlsCard
          className="mx-w-md w-sm"
          event={event}
          setEvent={setEvent}
          refetchEvent={refetchEvent}
        />

        <section className="max-w-lg w-lg">
          <TopRequestList title="Top Requested Songs" requests={topRequested} />
        </section>

        <section className="max-w-lg w-lg">
          <Card className=" backdrop-blur supports-backdrop-filter:bg-muted-90/20">
            <CardHeader>
              <h2 className="text-lg font-semibold mr-auto text-muted-60">
                Request List ({filteredRequests.length}/{totalCount})
              </h2>
              <button
                type="button"
                onClick={clearFilters}
                disabled={selectedStatuses.size === 0}
                className="text-sm font-medium bg-clear text-muted-90 ml-auto hover:cursor-pointer disabled:opacity-50"
              >
                <FilterX />
              </button>
              <div className="flex flex-nowrap items-center gap-2">
                {STATUS_OPTIONS.map((status) => {
                  const active = selectedStatuses.has(status);
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => toggleStatus(status)}
                      className={`px-3 py-1 rounded text-sm font-medium transition 
                    ${active ? "bg-muted-10 text-white border border-muted-10 hover:cursor-pointer" : "border bg-transparent border-muted-20 text-muted-60 hover:bg-muted-20 hover:text-white hover:cursor-pointer"}`}
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
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <FullRequestList
                requests={filteredRequests}
                hiddenTitle={true}
                onSetStatus={setRequestStatus}
                updatingId={updatingId}
                className="max-h-103 overflow-scroll no-scrollbar"
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </PageShell>
  );
}
