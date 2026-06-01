"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LabeledSelect,
  LabeledSelectOption,
} from "@/components/ui/LabeledSelect";
import { EventState } from "@/hooks/guest/useEventByCode";
import {
  patchEventAllowRequests,
  patchEventDetails,
} from "@/lib/client/api/dj";
import { lifecycleStatus, routes } from "@/lib/shared/constants/routes";
import {
  EventLifecycleStatus,
  EventMode,
  QrDesignPresetId,
} from "@/types/database";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { DJ_EVENTS_MODE_OPTIONS } from "../../dashboard/dj-events-mode-options";
import { AllowRequestsSwitch } from "@/components/ui/AllowRequestsSwitch";
import { useRouter } from "next/navigation";
import { featureFlags } from "@/lib/shared/config/feature-flags";
import { normalizeEventColor } from "@/lib/shared/custom-event-designs/normalize-event-color";
import { QR_DESIGN_PRESETS } from "@/lib/shared/custom-event-designs/qr-presets";
import { downloadEventQrPng } from "@/lib/client/download-event-qr-png";
import { EventQrCode } from "@/components/custom-event-designs/EventQrCode";

export type DjEventControlsCardProps = {
  event: NonNullable<EventState>;
  setEvent: React.Dispatch<React.SetStateAction<EventState>>;
  refetchEvent?: () => Promise<void>;
  className?: string;
};

const DJ_EVENT_LIFECYCLE_OPTIONS: LabeledSelectOption<EventLifecycleStatus>[] =
  [
    { value: lifecycleStatus.lower.draft, label: lifecycleStatus.cased.draft },
    { value: lifecycleStatus.lower.live, label: lifecycleStatus.cased.live },
    { value: lifecycleStatus.lower.ended, label: lifecycleStatus.cased.ended },
    {
      value: lifecycleStatus.lower.archived,
      label: lifecycleStatus.cased.archived,
    },
  ];

function serverFormFieldsSnapshot(event: NonNullable<EventState>) {
  return [
    event.id,
    event.name,
    event.event_mode,
    event.event_date ?? "",
    event.event_code,
    event.event_color ?? "",
    event.qr_design,
    event.event_code_edits_remaining,
  ].join("|");
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
  className = "",
}: DjEventControlsCardProps) {
  const router = useRouter();

  const [nameDraft, setNameDraft] = useState(event.name);
  const [savingName, setSavingName] = useState(false);

  const [dateDraft, setDateDraft] = useState(event.event_date ?? "");
  const [savingDate, setSavingDate] = useState(false);
  const [updatingMode, setUpdatingMode] = useState(false);

  const [updatingLifecycle, setUpdatingLifecycle] = useState(false);
  const [togglingAllow, setTogglingAllow] = useState(false);

  const [codeDraft, setCodeDraft] = useState(event.event_code);
  const [savingCode, setSavingCode] = useState(false);
  const [colorDraft, setColorDraft] = useState(event.event_color ?? "");
  const [savingColor, setSavingColor] = useState(false);
  const [colorError, setColorError] = useState<string | null>(null);
  const [qrDesignDraft, setQrDesignDraft] = useState<QrDesignPresetId>(
    event.qr_design,
  );
  const [savingQrDesign, setSavingQrDesign] = useState(false);
  const showDesignFields = featureFlags.customEventDesigns;
  const canEditCode = event.event_code_edits_remaining > 0;
  const colorPickerValue =
    normalizeEventColor(colorDraft) ?? event.event_color ?? "#7c3aed";

  const isEventLive = event.lifecycle_status === lifecycleStatus.lower.live;
  const disableAllowRequestsToggle = togglingAllow || !isEventLive;

  const exportQrRef = useRef<HTMLDivElement>(null);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const requestUrl = `${baseUrl}/event/${event.event_code}/request`;

  async function handleSaveName() {
    if (savingName) return;
    const next = nameDraft.trim();
    if (!next || next === event.name) return;

    setSavingName(true);

    const result = await patchEventDetails(event.id, { name: next });

    setSavingName(false);

    if (!applyPatchedEvent(result, "Could not update event name")) return;

    toast.success("Event name updated");
  }
  async function handleLifecycleChange(next: EventLifecycleStatus) {
    if (updatingLifecycle || next === event.lifecycle_status) return;
    setUpdatingLifecycle(true);

    const result = await patchEventDetails(event.id, {
      lifecycle_status: next,
    });

    setUpdatingLifecycle(false);

    if (!applyPatchedEvent(result, "Could not update lifecycle")) return;

    toast.success("Lifecycle updated");
  }
  async function handleModeChange(next: EventMode) {
    if (updatingMode || next === event.event_mode) return;
    setUpdatingMode(true);

    const result = await patchEventDetails(event.id, { event_mode: next });

    setUpdatingMode(false);

    if (!applyPatchedEvent(result, "Could not update event mode")) return;

    toast.success("Event mode updated");
  }
  async function handleSaveDate() {
    if (savingDate) return;
    const nextDate = dateDraft.trim() === "" ? null : dateDraft.trim();
    if (nextDate === event.event_date) return;
    setSavingDate(true);

    const result = await patchEventDetails(event.id, { event_date: nextDate });

    setSavingDate(false);

    if (!applyPatchedEvent(result, "Could not update event date")) return;

    toast.success("Event date updated");
  }
  async function handleSaveCode() {
    if (savingCode || !canEditCode) return;

    const next = codeDraft.trim();
    if (!next || next === event.event_code) return;

    setSavingCode(true);

    const result = await patchEventDetails(event.id, { event_code: next });

    setSavingCode(false);

    if (!applyPatchedEvent(result, "Could not update event code")) return;

    const updated = result.data;
    if (updated && updated.event_code !== event.event_code) {
      router.replace(routes.dj.eventDetailByCode(updated.event_code));
    }

    toast.success("Event code updated");
  }

  async function handleSaveColor() {
    if (savingColor) return;

    const next =
      colorDraft.trim() === "" ? null : normalizeEventColor(colorDraft.trim());

    if (colorDraft.trim() !== "" && !next) {
      setColorError("Enter a valid color: hex, rgb, hsl, or name like purple");
      return;
    }

    if (next === event.event_color) return;

    setSavingColor(true);

    const result = await patchEventDetails(event.id, { event_color: next });

    setSavingColor(false);

    if (!applyPatchedEvent(result, "Could not update event color")) return;

    toast.success("Event color updated");
  }

  async function handleQrDesignChange(next: QrDesignPresetId) {
    if (savingQrDesign || next === event.qr_design) return;

    setQrDesignDraft(next);
    setSavingQrDesign(true);

    const result = await patchEventDetails(event.id, { qr_design: next });

    setSavingQrDesign(false);

    if (!applyPatchedEvent(result, "Could not update QR design")) return;

    toast.success("QR design updated");
  }
  function handleDownloadQr() {
    const canvas = exportQrRef.current?.querySelector("canvas");
    if (!canvas) {
      toast.error("Could not prepare QR for download");
      return;
    }
    try {
      downloadEventQrPng(canvas, event.event_code);
      toast.success("QR downloaded.");
    } catch {
      toast.error("Could not download QR.");
    }
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

  function applyPatchedEvent(
    result: {
      data: Awaited<ReturnType<typeof patchEventDetails>>["data"];
      error: string | null;
    },
    fallbackMessage: string,
  ): boolean {
    if (result.error || !result.data) {
      toast.error(result.error ?? fallbackMessage);
      return false;
    }
    setEvent((prev) => (prev ? { ...prev, ...result.data! } : prev));
    return true;
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
          id={`dj-event-lifecycle-${event.id}`}
          label="Lifecycle"
          labelClassName="text-md text-muted-80"
          contentClassName="rounded border bg-transparent px-2 py-1 text-sm"
          value={event.lifecycle_status}
          onValueChange={handleLifecycleChange}
          options={DJ_EVENT_LIFECYCLE_OPTIONS}
          disabled={updatingLifecycle}
        />
        <LabeledSelect
          labelClassName="text-md text-muted-80"
          id={`dj-event-mode-${event.id}`}
          label="Event mode"
          value={event.event_mode}
          onValueChange={(next) => handleModeChange(next as EventMode)}
          options={DJ_EVENTS_MODE_OPTIONS}
          disabled={updatingMode}
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

        {showDesignFields ? (
          <div className="space-y-4 rounded-lg border border-muted-20 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label
                  htmlFor={`dj-event-code-${event.id}`}
                  className="text-muted-80"
                >
                  Custom event code:
                </Label>
                <span className="text-xs text-muted-60">
                  {event.event_code_edits_remaining} edits remaining
                </span>
              </div>

              {canEditCode ? (
                <div className="flex flex-wrap gap-2">
                  <Input
                    id={`dj-event-code-${event.id}`}
                    value={codeDraft}
                    onChange={(e) => setCodeDraft(e.target.value)}
                    placeholder="my-friday-set"
                    autoCapitalize="off"
                    autoCorrect="off"
                    disabled={savingCode}
                    className="min-w-48 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveCode}
                    disabled={
                      savingCode ||
                      !codeDraft.trim() ||
                      codeDraft.trim() === event.event_code
                    }
                    className="border-muted-90 text-muted-90"
                  >
                    {savingCode ? "Saving..." : "Save code"}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-60">
                  This event has used all custom code edits.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor={`dj-event-color-${event.id}`}
                className="text-muted-80"
              >
                Event color:
              </Label>

              <div className="flex flex-wrap items-center gap-2">
                <Input
                  id={`dj-event-color-${event.id}`}
                  type="color"
                  value={colorPickerValue}
                  onChange={(e) => {
                    setColorDraft(e.target.value);
                    setColorError(null);
                  }}
                  className="h-10 w-14 cursor-pointer p-1"
                />
                <Input
                  value={colorDraft}
                  onChange={(e) => {
                    setColorDraft(e.target.value);
                    setColorError(null);
                  }}
                  placeholder="#7c3aed, rgb(124, 58, 237), purple"
                  className="min-w-48 flex-1 font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveColor}
                  disabled={
                    savingColor ||
                    colorDraft.trim() === (event.event_color ?? "")
                  }
                  className="border-muted-90 text-muted-90"
                >
                  {savingColor ? "Saving..." : "Save color"}
                </Button>
              </div>

              {colorError ? (
                <p className="text-xs text-red-500">{colorError}</p>
              ) : (
                <p className="text-xs text-muted-60">
                  Leave blank to clear the custom color.
                </p>
              )}
            </div>

            <LabeledSelect
              id={`dj-event-qr-design-${event.id}`}
              label="QR design"
              labelClassName="text-md text-muted-80"
              value={qrDesignDraft}
              onValueChange={(next) =>
                void handleQrDesignChange(next as QrDesignPresetId)
              }
              options={QR_DESIGN_PRESETS.map((preset) => ({
                value: preset.id,
                label: preset.label,
              }))}
              disabled={savingQrDesign}
            />

            <div className="space-y-2 pt-2">
              <p className="text-sm text-muted-80">Share QR</p>
              <div className="flex justify-center rounded-lg bg-white p-4">
                <EventQrCode
                  value={requestUrl}
                  size={180}
                  eventColor={event.event_color}
                  qrDesign={event.qr_design}
                  variant="display"
                />
              </div>
              <Button
                type="button"
                variant={"outline"}
                onClick={handleDownloadQr}
              >
                Download QR (PNG)
              </Button>
              <div ref={exportQrRef} className="sr-only" aria-hidden>
                <EventQrCode
                  value={requestUrl}
                  size={960}
                  eventColor={event.event_color}
                  qrDesign={event.qr_design}
                  variant="export"
                />
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
