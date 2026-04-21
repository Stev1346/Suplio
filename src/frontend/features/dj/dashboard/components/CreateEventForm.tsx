import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LabeledSelect } from "@/components/ui/LabeledSelect";
import { eventMode } from "@/lib/shared/constants/routes";
import { EventMode } from "@/types/database";
import { useState } from "react";
import { DJ_EVENTS_MODE_OPTIONS } from "../dj-events-mode-options";
import toast from "react-hot-toast";

export type CreateEventFormPayload = {
  name: string;
  event_mode: EventMode;
  event_date: string | null;
};

type CreateEventCardProps = {
  loading: boolean;
  error: string | null;
  onSubmit: (payload: CreateEventFormPayload) => Promise<boolean>;
  submitLabel?: string;
  showCancel?: boolean;
  onCancel?: () => void;
};

function resetFormfields(
  setName: (v: string) => void,
  setEventDate: (v: string) => void,
  setEventModeValue: (v: EventMode) => void,
) {
  setName("");
  setEventDate("");
  setEventModeValue(eventMode.lower.songRequest);
}

export function CreateEventForm({
  loading,
  error,
  onSubmit,
  submitLabel = "Create",
  showCancel,
  onCancel,
}: CreateEventCardProps) {
  const [name, setName] = useState("");
  const [eventModeValue, setEventModeValue] = useState<EventMode>(
    eventMode.lower.songRequest,
  );
  const [eventDate, setEventDate] = useState("");

  function handleCancel() {
    resetFormfields(setName, setEventDate, setEventModeValue);
    onCancel?.();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const ok = await onSubmit({
      name: name.trim(),
      event_mode: eventModeValue,
      event_date: eventDate.trim() === "" ? null : eventDate.trim(),
    });

    if (ok) {
      resetFormfields(setName, setEventDate, setEventModeValue);
    }
    if (!ok) {
      toast.error(error ?? "Something is missing...");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 flex-col flex">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="space-y-2 sm:flex-1">
          <Label htmlFor="create-event-name">Event name</Label>
          <Input
            id="create-event-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Event name"
          />
        </div>
        <div className="space-y-2 sm:flex-1">
          <Label htmlFor="create-event-date">Event date</Label>
          <Input
            id="create-event-date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2 sm:flex-1">
        <LabeledSelect
          id="create-event-mode"
          label="Mode"
          value={eventModeValue}
          onValueChange={(next) => setEventModeValue(next)}
          options={DJ_EVENTS_MODE_OPTIONS}
        />
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {showCancel && onCancel ? (
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={handleCancel}
          >
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : submitLabel}
        </Button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
    </form>
  );
}
