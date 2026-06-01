import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LabeledSelect } from "@/components/ui/LabeledSelect";
import {
  DjEventListItem,
  DjEventsLifecycleFilter,
  patchEventDetails,
} from "@/lib/client/api/dj";
import { lifecycleStatus } from "@/lib/shared/constants/routes";
import { DJ_EVENTS_LIFECYCLE_FILTER_OPTIONS } from "../dj-events-lifecycle-filter-options";
import { EventLifecycleStatus } from "@/types/database";
import { useState } from "react";
import { ArchiveIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreatedEventInfo from "../../events/components/CreatedEventInfo";

type RecentEventsListProps = {
  items: DjEventListItem[];
  page: number;
  hasNextPage: boolean;
  onPrev: () => void;
  onNext: () => void;
  lifecycle: DjEventsLifecycleFilter;
  onLifecycleChange: (next: DjEventsLifecycleFilter) => void;
  onChanged?: () => void | Promise<void>;
  className?: string;
};

const BADGE_STYLES: Record<EventLifecycleStatus, string> = {
  draft: "bg-muted-20 text-muted-80 border-muted-40",
  live: "bg-secondary-90 text-secondary-20 border-secondary-40",
  ended: "bg-accent-90 text-accent-20 border-accent-40",
  archived: "bg-muted-10 text-muted-60 border-muted-20",
};

function LifecycleBadge({ status }: { status: EventLifecycleStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${BADGE_STYLES[status]}`}
      aria-label={`Status: ${lifecycleStatus.cased[status]}`}
    >
      {lifecycleStatus.cased[status]}
    </span>
  );
}

function EventRow({
  event,
  onChanged,
}: {
  event: DjEventListItem;
  onChanged?: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const isArchived = event.lifecycle_status === lifecycleStatus.lower.archived;
  async function handleArchive() {
    if (busy || isArchived) return;
    if (
      !window.confirm(
        `Archive "${event.name}"? It will be hidden from your active events list.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await patchEventDetails(event.id, {
      lifecycle_status: lifecycleStatus.lower.archived,
    });
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    await onChanged?.();
  }
  return (
    <div className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{event.name}</p>
          <LifecycleBadge status={event.lifecycle_status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Code: {event.event_code}
        </p>
        {error ? (
          <p className="mt-1 text-xs text-red-500" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant={"outline"} onClick={() => setInfoOpen(true)}>
          View Event Info
        </Button>
        <Button
          variant={"danger"}
          onClick={handleArchive}
          disabled={busy || isArchived}
          aria-label={isArchived ? "Event already archived" : "Archive event"}
        >
          {isArchived ? "Archived" : busy ? "Archiving..." : <ArchiveIcon />}
        </Button>
      </div>

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{event.name}</DialogTitle>
          </DialogHeader>

          <CreatedEventInfo
            createdCode={event.event_code}
            eventColor={event.event_color}
            qrDesign={event.qr_design}
            title="Event Info"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function RecentEventsList({
  items,
  page,
  hasNextPage,
  onPrev,
  onNext,
  lifecycle,
  onLifecycleChange,
  onChanged,
  className,
}: RecentEventsListProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle>My Events</CardTitle>
          <LabeledSelect
            id="events-lifecycle-filter"
            label="Filter"
            value={lifecycle}
            onValueChange={onLifecycleChange}
            options={DJ_EVENTS_LIFECYCLE_FILTER_OPTIONS}
            placeholder="Lifecycle"
            labelClassName="text-secondary-20"
            className="text-secondary-20"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events to show.</p>
        ) : (
          items.map((event) => (
            <EventRow key={event.id} event={event} onChanged={onChanged} />
          ))
        )}
        <div className="flex gap-2">
          <Button variant={"outline"} disabled={page <= 1} onClick={onPrev}>
            Previous
          </Button>
          <Button variant={"outline"} disabled={!hasNextPage} onClick={onNext}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
