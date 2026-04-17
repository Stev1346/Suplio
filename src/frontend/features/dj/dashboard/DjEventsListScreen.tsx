"use client";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageShell } from "@/components/ui/PageShell";
import { useDjEventsPage } from "@/hooks/dj/useDjEventsPage";
import { RecentEventsList } from "./components/RecentEventsList";

export default function DjEventsListScreen() {
  const events = useDjEventsPage(1, 10, { realtime: true });

  return (
    <PageShell className="flex flex-col gap-6" centralize={false}>
      {events.error ? (
        <p className="text-sm text-red-500">{events.error}</p>
      ) : null}

      {events.loading && !events.data ? (
        <PageShell>
          <LoadingSpinner />
        </PageShell>
      ) : (
        <RecentEventsList
          items={events.data?.items ?? []}
          page={events.page}
          hasNextPage={events.data?.hasNextPage ?? false}
          onPrev={() => events.setPage((p) => Math.max(1, p - 1))}
          onNext={() => events.setPage((p) => p + 1)}
        />
      )}
    </PageShell>
  );
}
