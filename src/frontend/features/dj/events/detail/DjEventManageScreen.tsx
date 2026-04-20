"use client";

import { FullRequestList } from "@/components/FullRequestList";
import { NotFound } from "@/components/NotFound";
import { TopRequestList } from "@/components/TopRequestList";
import { AllowRequestsSwitch } from "@/components/ui/AllowRequestsSwitch";
import { PageShell } from "@/components/ui/PageShell";
import { useEvent } from "@/hooks/guest/useEventByCode";
import { useEventRequests } from "@/hooks/guest/useEventRequests";
import {
  patchEventAllowRequests,
  patchEventDetails,
  patchRequestStatus,
} from "@/lib/client/api/dj";
import { compareRankedRequests } from "@/lib/request-ranking";
import { EventLifecycleStatus, SongRequestStatus } from "@/types/database";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import {
  lifecycleStatus,
  requestStatus,
  routes,
} from "@/lib/shared/constants/routes";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";

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
  const [selectedStatuses, setSelectedStatuses] = useState<Set<SongRequestStatus>>(
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
  const statusCounts = useMemo<Record<SongRequestStatus, number>>(
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

  const [nameDraftByEventId, setNameDraftByEventId] = useState<
    Record<string, string>
  >({});
  const [savingName, setSavingName] = useState(false);
  const [updatingLifecycle, setUpdatingLifecycle] = useState(false);
  const draftName = event ? (nameDraftByEventId[event.id] ?? event.name) : "";
  const setDraftName = (next: string) => {
    if (!event) return;
    setNameDraftByEventId((prev) => ({ ...prev, [event.id]: next }));
  };

  const isEventLive = event?.lifecycle_status === lifecycleStatus.lower.live;
  const disableAllowRequestsToggle = togglingAllow || !isEventLive;

  async function handleToggleAllowRequests() {
    if (
      !event ||
      togglingAllow ||
      event.lifecycle_status !== lifecycleStatus.lower.live
    )
      return;

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

  async function handleSaveName() {
    if (!event || savingName) return;
    const nextName = draftName.trim();
    if (!nextName || nextName === event.name) return;

    setSavingName(true);
    const { error } = await patchEventDetails(event.id, { name: nextName });
    setSavingName(false);

    if (error) {
      toast.error(error);
      return;
    }
    setEvent((prev) => (prev ? { ...prev, name: nextName } : prev));
    toast.success("Event name updated");
  }

  async function handleLifecycleChange(next: EventLifecycleStatus) {
    if (!event || updatingLifecycle || next === event.lifecycle_status) return;

    setUpdatingLifecycle(true);
    const { error } = await patchEventDetails(event.id, {
      lifecycle_status: next,
    });
    setUpdatingLifecycle(false);

    if (error) {
      toast.error(error);
      return;
    }

    await refetchEvent();
    toast.success("Lifecycle updated");
  }

  async function setRequestStatus(requestId: string, status: SongRequestStatus) {
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
        <Link
          href={routes.guest.eventLanding(eventCode)}
          target="_blank"
          className="text-accent-80 text-lg hover:underline"
        >
          Event code: {eventCode}
        </Link>
        <section className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-80">Event Status:</span>
            <select
              className="rounded border bg-transparent px-2 py-1 text-sm"
              value={event.lifecycle_status}
              onChange={(e) =>
                handleLifecycleChange(e.target.value as EventLifecycleStatus)
              }
              disabled={updatingLifecycle}
            >
              <option value={lifecycleStatus.lower.draft}>
                {lifecycleStatus.cased.draft}
              </option>
              <option value={lifecycleStatus.lower.live}>
                {lifecycleStatus.cased.live}
              </option>
              <option value={lifecycleStatus.lower.ended}>
                {lifecycleStatus.cased.ended}
              </option>
              <option value={lifecycleStatus.lower.archived}>
                {lifecycleStatus.cased.archived}
              </option>
            </select>
          </div>

          <div className="flex flex-col justify-center">
            <AllowRequestsSwitch
              checked={isEventLive ? event.allow_requests : false}
              onToggle={handleToggleAllowRequests}
              disabled={disableAllowRequestsToggle}
            />
            {!isEventLive && (
              <p className="text-xs text-accent-80">
                Requests can only be enabled when the event is Live.
              </p>
            )}
          </div>
        </section>
      </header>
      <section className="w-full max-w-xl space-y-3 mb-3">
        <div className="flex gap-2">
          <Input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="Event name"
            disabled={savingName}
          />
          <Button
            onClick={handleSaveName}
            disabled={savingName || !draftName.trim()}
          >
            {savingName ? "Saving..." : "Save"}
          </Button>
        </div>
      </section>
      {(eventError || requestError) && (
        <p className="text-red-400 text-sm mb-2">
          {requestError ?? eventError}
        </p>
      )}
      <div className="grid grid-cols-1 gap-8 justify-between md:grid-cols-2">
        <section className="mb-8 xl:w-2xl">
          <TopRequestList title="Top Requested Songs" requests={topRequested} />
        </section>

        <section className="mb-8 xl:w-2xl">
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
                    ${active ? "bg-muted-10 text-white border border-muted-10" : "border bg-transparent border-muted-20 text-muted-20 hover:bg-muted-20 hover:text-white hover:cursor-pointer"}`}
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
