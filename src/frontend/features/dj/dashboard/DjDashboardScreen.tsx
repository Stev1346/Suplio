"use client";

import { PageShell } from "@/components/ui/PageShell";
import { useDjDashboard } from "@/hooks/dj/useDjDashboard";
import { useDjEventsPage } from "@/hooks/dj/useDjEventsPage";
import { MetricCard } from "./components/MetricCard";
import { RecentEventsList } from "./components/RecentEventsList";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { useDjCreateEventModal } from "@/contexts/DjCreateEventModalContext";
import { useEffect } from "react";

export default function DjDashboardScreen() {
  const {open, registerAfterCreate} = useDjCreateEventModal();
  const dashboard = useDjDashboard({ realtime: true });
  const events = useDjEventsPage(1, 8, { realtime: true });

  useEffect(() => {
    return registerAfterCreate(async () => {
      await Promise.all([dashboard.refetch(), events.refetch()]);
    });
  }, [registerAfterCreate, dashboard, events])

  const metrics = dashboard.data?.metrics ?? {
    activeEvents: 0,
    requestsOpen: 0,
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    playedRequests: 0,
    rejectedRequests: 0,
    draftEvents: 0,
    liveEvents: 0,
    endedEvents: 0,
    archivedEvents: 0,
  };

  return (
    <PageShell className="flex flex-col gap-6" centralize={false}>
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-muted-60">Overview</h2>
            <Button
              type="button"
              onClick={() => open()}
              className="inline-flex items-center gap-2"
            >
              <Plus className="size-4" aria-hidden />
              Create event
            </Button>
          </div>
          
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard title="Active Events" value={metrics.activeEvents} />
            <MetricCard title="Draft Events" value={metrics.draftEvents} />
            <MetricCard title="Live Events" value={metrics.liveEvents} />
            <MetricCard title="Ended Events" value={metrics.endedEvents} />
            <MetricCard
              title="Archived Events"
              value={metrics.archivedEvents}
            />
            <MetricCard title="Requests Open" value={metrics.requestsOpen} />
            <MetricCard title="Total Requests" value={metrics.totalRequests} />
            <MetricCard
              title="Pending Requests"
              value={metrics.pendingRequests}
            />
            <MetricCard
              title="Accepted Requests"
              value={metrics.acceptedRequests}
            />
            <MetricCard
              title="Played Requests"
              value={metrics.playedRequests}
            />
            <MetricCard
              title="Rejected Requests"
              value={metrics.rejectedRequests}
            />
          </section>
        </div>

        <RecentEventsList
          items={events.data?.items ?? []}
          page={events.page}
          hasNextPage={events.data?.hasNextPage ?? false}
          onPrev={() => events.setPage((p) => Math.max(1, p - 1))}
          onNext={() => events.setPage((p) => p + 1)}
          lifecycle={events.lifecycle}
          onLifecycleChange={events.setLifecyle}
          onChanged={async () => {
            await Promise.all([events.refetch(), dashboard.refetch()]);
          }}
          className=""
        />
      </section>
    </PageShell>
  );
}
