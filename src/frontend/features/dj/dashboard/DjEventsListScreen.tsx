"use client";

import { PageShell } from "@/components/ui/PageShell";
import { useDjEventsPage } from "@/hooks/dj/useDjEventsPage";
import { RecentEventsList } from "./components/RecentEventsList";
import { LoadingState } from "@/components/ui/LoadingState";

export default function DjEventsListScreen() {
  const events = useDjEventsPage(1, 10, { realtime: true });

  return (
    <PageShell className="flex flex-col gap-6" centralize={false}>
      {events.error ? (
        <p className="text-sm text-red-500">{events.error}</p>
      ) : null}

      {events.loading && !events.data ? (
        <div
          className="flex items-center justify-center flex-1 py-12"
          role="status"
          aria-live="polite"
        >
          <LoadingState />
        </div>
      ) : (
        <RecentEventsList
          items={events.data?.items ?? []}
          page={events.page}
          hasNextPage={events.data?.hasNextPage ?? false}
          onPrev={() => events.setPage((p) => Math.max(1, p - 1))}
          onNext={() => events.setPage((p) => p + 1)}
          lifecycle={events.lifecycle}
          onLifecycleChange={events.setLifecyle}
        />
      )}
    </PageShell>
  );
}
