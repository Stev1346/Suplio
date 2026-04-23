"use client";

import { FullRequestList } from "@/components/FullRequestList";
import { NotFound } from "@/components/NotFound";
import { TopRequestList } from "@/components/TopRequestList";
import { PageShell } from "@/components/ui/PageShell";
import { useEvent } from "@/hooks/guest/useEventByCode";
import { useEventRequests } from "@/hooks/guest/useEventRequests";
import { patchRequestStatus } from "@/lib/client/api/dj";
import { compareRankedRequests } from "@/lib/request-ranking";
import { RequestStatus } from "@/types/database";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import {
  eventMode,
  karaokeRequestStatus,
  requestStatus,
  routes,
} from "@/lib/shared/constants/routes";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { LoadingState } from "@/components/ui/LoadingState";
import { DjEventControlsCard } from "../components/DjEventControlsCard";
import { RequestStatusFilters } from "../components/RequestStatusFilters";
import { KaraokeDJQueueList } from "../components/KaraokeDJQueueList";

function eventCodeFromParams(
  raw: string | string[] | undefined,
): string | undefined {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && raw[0]) return raw[0];
  return undefined;
}

const KARAOKE_QUEUE_ORDER: Record<string, number> = {
  [karaokeRequestStatus.lower.performingNow]: 0,
  [karaokeRequestStatus.lower.upNext]: 1,
  [karaokeRequestStatus.lower.queued]: 2,
  [karaokeRequestStatus.lower.performed]: 3,
  [karaokeRequestStatus.lower.rejected]: 4,
};

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
    {
      orderBy:
        event?.event_mode === eventMode.lower.karaoke
          ? "created_at"
          : "song_name",
      ascending: true,
    },
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
  const karaokeRows = requests.filter(
    (r) => r.request_type === eventMode.lower.karaoke,
  );
  const karaokeVisibleRows = useMemo(() => {
    const base =
      selectedStatuses.size > 0
        ? karaokeRows.filter((r) => selectedStatuses.has(r.status))
        : karaokeRows.filter(
            (r) =>
              r.status !== karaokeRequestStatus.lower.rejected &&
              r.status !== karaokeRequestStatus.lower.performed,
          );
    return [...base].sort((a, b) => {
      const orderA = KARAOKE_QUEUE_ORDER[a.status] ?? Number.MAX_SAFE_INTEGER;
      const orderB = KARAOKE_QUEUE_ORDER[b.status] ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      // within same status bucket, oldest first
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }, [karaokeRows, selectedStatuses]);

  const isKaraokeEvent = event?.event_mode === eventMode.lower.karaoke;
  const isLoading = !!eventCode && (eventLoading || requestsLoading);

  const visibleCount = isKaraokeEvent
    ? karaokeVisibleRows.length
    : filteredRequests.length;
  const totalCount = isKaraokeEvent ? karaokeRows.length : requests.length;

  const STATUS_OPTIONS: RequestStatus[] = isKaraokeEvent
    ? [
        karaokeRequestStatus.lower.performingNow,
        karaokeRequestStatus.lower.upNext,
        karaokeRequestStatus.lower.queued,
        karaokeRequestStatus.lower.performed,
        karaokeRequestStatus.lower.rejected,
      ]
    : [
        requestStatus.lower.pending,
        requestStatus.lower.accepted,
        requestStatus.lower.rejected,
        requestStatus.lower.played,
      ];

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
          performed: 0,
        },
      ),
    [requests],
  );

  async function setRequestStatus(requestId: string, status: RequestStatus) {
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

  function toggleStatus(status: RequestStatus) {
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
          <p className="text-lg text-secondary-70">
            Event Date: {event.event_date}
          </p>
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

      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <DjEventControlsCard
          className="mx-w-md  lg:w-sm"
          event={event}
          setEvent={setEvent}
          refetchEvent={refetchEvent}
        />

        {!isKaraokeEvent ? (
          <section className="max-w-lg w-lg">
            <TopRequestList
              title="Top Requested Songs"
              requests={topRequested}
            />
          </section>
        ) : null}

        <section className="max-w-lg w-lg">
          <Card className=" backdrop-blur supports-backdrop-filter:bg-muted-90/20">
            <CardHeader>
              <h2 className="text-lg font-semibold mr-auto text-muted-60">
                Request List ({visibleCount}/{totalCount})
              </h2>
              <RequestStatusFilters
                statuses={STATUS_OPTIONS}
                selected={selectedStatuses}
                counts={statusCounts}
                onToggle={toggleStatus}
                onClear={clearFilters}
              />
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {isKaraokeEvent ? (
                <>
                  <KaraokeDJQueueList
                    requests={karaokeVisibleRows}
                    title="Karaoke Queue"
                    updatingId={updatingId}
                    onSetStatus={(id, status) =>
                      void setRequestStatus(id, status)
                    }
                    className="max-h-103 overflow-scroll no-scrollbar"
                  />
                </>
              ) : (
                <FullRequestList
                  requests={filteredRequests}
                  hiddenTitle={true}
                  onSetStatus={setRequestStatus}
                  updatingId={updatingId}
                  className="max-h-103 overflow-scroll no-scrollbar"
                />
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </PageShell>
  );
}
