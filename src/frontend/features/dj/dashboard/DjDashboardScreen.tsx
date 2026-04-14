"use client";

import { PageShell } from "@/components/ui/PageShell";
import { useCreateEvent } from "@/hooks/dj/useCreateEvent";
import { useDjDashboard } from "@/hooks/dj/useDjDashboard";
import { useDjEventsPage } from "@/hooks/dj/useDjEventsPage";
import { CreateEventCard } from "./components/CreateEventCard";
import { MetricCard } from "./components/MetricCard";
import { RecentEventsList } from "./components/RecentEventsList";

export default function DjDashboardScreen() {
  const createEvent = useCreateEvent();
  const dashboard = useDjDashboard({realtime: true});
  const events = useDjEventsPage(1, 8, {realtime: true});

  async function handleCreate(name: string) {
    const code = await createEvent.submit(name);
    if (!code) return;
    await Promise.all([dashboard.refetch(), events.refetch()]);
  }

  const metrics = dashboard.data?.metrics ?? {
    totalEvents: 0,
    openEvents: 0,
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    playedRequests: 0,
    rejectedRequests: 0
  };

  return (
    <PageShell className="flex flex-col gap-6" centralize={false}>
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-4">
          <CreateEventCard
            loading={createEvent.loading}
            error={createEvent.error}
            onCreate={handleCreate}
          />
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard title="Total Events" value={metrics.totalEvents} />
            <MetricCard title="Open Events" value={metrics.openEvents} />
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
        />
      </section>
    </PageShell>
  );
}
