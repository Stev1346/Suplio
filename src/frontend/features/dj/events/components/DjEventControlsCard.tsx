"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LabeledSelect } from "@/components/ui/LabeledSelect";
import { EventState } from "@/hooks/guest/useEventByCode";
import {
  patchEventAllowRequests,
  patchEventDetails,
} from "@/lib/client/api/dj";
import { lifecycleStatus } from "@/lib/shared/constants/routes";
import { EventLifecycleStatus, EventMode } from "@/types/database";
import { useState } from "react";
import toast from "react-hot-toast";
import { EVENT_LIFECYCLE_STATUS_OPTIONS } from "../../dashboard/events-lifecycle-status";
import { DJ_EVENTS_MODE_OPTIONS } from "../../dashboard/dj-events-mode-options";
import { AllowRequestsSwitch } from "@/components/ui/AllowRequestsSwitch";

export type DjEventControlsCardProps = {
  event: NonNullable<EventState>;
  setEvent: React.Dispatch<React.SetStateAction<EventState>>;
  refetchEvent?: () => Promise<void>;
  className?: string;
};

function serverFormFieldsSnapshot(event: NonNullable<EventState>) {
  return `${event.id}|${event.name}|${event.event_mode}|${event.event_date ?? ""}`;
}

export function DjEventControlsCard(props: DjEventControlsCardProps) {
  return (
    <DjEventControlsCardInner
      key={serverFormFieldsSnapshot(props.event)}
      {...props}
    />
  );
}

function DjEventControlsCardInner({
  event,
  setEvent,
  refetchEvent,
  className = "",
}: DjEventControlsCardProps) {
  const [nameDraft, setNameDraft] = useState(event.name);
  const [savingName, setSavingName] = useState(false);

  const [dateDraft, setDateDraft] = useState(event.event_date ?? "");
  const [savingDate, setSavingDate] = useState(false);
  const [updatingMode, setUpdatingMode] = useState(false);

  const [updatingLifecycle, setUpdatingLifecycle] = useState(false);
  const [togglingAllow, setTogglingAllow] = useState(false);

  const isEventLive = event.lifecycle_status === lifecycleStatus.lower.live;
  const disableAllowRequestsToggle = togglingAllow || !isEventLive;

  async function handleSaveName() {
    if (savingName) return;
    const next = nameDraft.trim();
    if (!next || next === event.name) return;
    setSavingName(true);
    const { error } = await patchEventDetails(event.id, { name: next });
    setSavingName(false);
    if (error) {
      toast.error(error);
      return;
    }
    setEvent((prev) => (prev ? { ...prev, name: next } : prev));
    toast.success("Event name updated");
  }
  async function handleLifecycleChange(next: EventLifecycleStatus) {
    if (updatingLifecycle || next === event.lifecycle_status) return;
    setUpdatingLifecycle(true);
    const { error } = await patchEventDetails(event.id, {
      lifecycle_status: next,
    });
    setUpdatingLifecycle(false);
    if (error) {
      toast.error(error);
      return;
    }
    await refetchEvent?.();
    toast.success("Lifecycle updated");
  }
  async function handleModeChange(next: EventMode) {
    if (updatingMode || next === event.event_mode) return;
    setUpdatingMode(true);
    const { error } = await patchEventDetails(event.id, {
      event_mode: next,
    });
    setUpdatingMode(false);
    if (error) {
      toast.error(error);
      return;
    }
    await refetchEvent?.();
    toast.success("Event mode updated");
  }
  async function handleSaveDate() {
    if (savingDate) return;
    const nextDate = dateDraft.trim() === "" ? null : dateDraft.trim();
    if (nextDate === event.event_date) return;
    setSavingDate(true);
    const { error } = await patchEventDetails(event.id, {
      event_date: nextDate,
    });
    setSavingDate(false);
    if (error) {
      toast.error(error);
      return;
    }
    setEvent((prev) => (prev ? { ...prev, event_date: nextDate } : prev));
    toast.success("Event settings updated");
  }
  async function handleToggleAllowRequests() {
    if (togglingAllow || event.lifecycle_status !== lifecycleStatus.lower.live)
      return;
    setTogglingAllow(true);
    const allowRequests = !event.allow_requests;
    const { error } = await patchEventAllowRequests(event.id, allowRequests);
    setTogglingAllow(false);
    if (error) {
      toast.error("Could not update setting. Try again");
      return;
    }
    setEvent((prev) =>
      prev ? { ...prev, allow_requests: allowRequests } : prev,
    );
  }

  const dateUnchanged =
    (dateDraft.trim() === "" ? null : dateDraft.trim()) === event.event_date;

  return (
    <Card
      className={
        className + " backdrop-blur supports-backdrop-filter:bg-muted-90/20"
      }
    >
      <CardHeader className="space-y-1">
        <h2 className="text-lg font-semibold text-muted-60">Event Controls</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label
            className="text-muted-80"
            htmlFor={`dj-event-name-${event.id}`}
          >
            Event name:
          </Label>

          <div className="flex flex-wrap gap-2">
            <Input
              id={`dj-event-name-${event.id}`}
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="Event name"
              disabled={savingName}
              className="min-w-48 flex-1"
            />
            <Button
              type="button"
              onClick={handleSaveName}
              disabled={
                savingName ||
                !nameDraft.trim() ||
                nameDraft.trim() === event.name
              }
            >
              {savingName ? "Saving..." : "Save name"}
            </Button>
          </div>
        </div>

        <LabeledSelect
          label="Lifecycle"
          labelClassName="text-md text-muted-80"
          contentClassName="rounded border bg-transparent px-2 py-1 text-sm"
          value={event.lifecycle_status}
          onValueChange={(next) =>
            handleLifecycleChange(next as EventLifecycleStatus)
          }
          options={EVENT_LIFECYCLE_STATUS_OPTIONS}
          disabled={updatingLifecycle}
        />
        <LabeledSelect
          labelClassName="text-md text-muted-80"
          id={`dj-event-mode-${event.id}`}
          label="Event mode"
          value={event.event_mode}
          onValueChange={(next) => handleModeChange(next as EventMode)}
          options={DJ_EVENTS_MODE_OPTIONS}
        />

        <div className="space-y-2">
          <Label
            htmlFor={`dj-event-date-${event.id}`}
            className="text-muted-80"
          >
            Event date:
          </Label>

          <div className="flex flex-wrap gap-2">
            <Input
              id={`dj-event-date-${event.id}`}
              type="date"
              value={dateDraft}
              onChange={(e) => setDateDraft(e.target.value)}
              className="min-w-48 flex-1"
            />
            <Button
              type="button"
              variant={"outline"}
              onClick={handleSaveDate}
              disabled={savingDate || dateUnchanged}
              className="text-muted-80"
            >
              {savingDate ? "Saving..." : "Save date"}
            </Button>
          </div>
        </div>

        <div className="border-t border-muted-20 pt-4">
          <AllowRequestsSwitch
            checked={isEventLive ? event.allow_requests : false}
            onToggle={handleToggleAllowRequests}
            disabled={disableAllowRequestsToggle}
          />
          {!isEventLive && (
            <p className="mt-1 text-xs text-accent-80">
              Requests can only be enabled when the event is Live.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
