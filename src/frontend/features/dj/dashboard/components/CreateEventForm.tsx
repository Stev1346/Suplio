import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LabeledSelect } from "@/components/ui/LabeledSelect";
import { eventMode } from "@/lib/shared/constants/routes";
import { EventMode, QrDesignPresetId } from "@/types/database";
import { useState } from "react";
import { DJ_EVENTS_MODE_OPTIONS } from "../dj-events-mode-options";
import toast from "react-hot-toast";
import { featureFlags } from "@/lib/shared/config/feature-flags";
import { QR_DESIGN_PRESETS } from "@/lib/shared/custom-event-designs/qr-presets";
import { normalizeEventColor } from "@/lib/shared/custom-event-designs/normalize-event-color";

export type CreateEventFormPayload = {
  name: string;
  event_mode: EventMode;
  event_date: string | null;
  event_code?: string;
  event_color?: string | null;
  qr_design?: QrDesignPresetId;
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
  setCustomCode: (v: string) => void,
  setEventColor: (v: string) => void,
  setQrDesign: (v: QrDesignPresetId) => void,
) {
  setName("");
  setEventDate("");
  setEventModeValue(eventMode.lower.songRequest);
  setCustomCode("");
  setEventColor("");
  setQrDesign("basic");
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
  const [customCode, setCustomCode] = useState("");
  const [eventColor, setEventColor] = useState("");

  const [eventColorError, setEventColorError] = useState<string | null>(null);
  const [qrDesign, setQrDesign] = useState<QrDesignPresetId>("basic");
  const normalizedEventColor = normalizeEventColor(eventColor);
  const colorPickerValue = normalizedEventColor ?? "#7c3aed";

  const showDesignFields = featureFlags.customEventDesigns;

  function handleCancel() {
    resetFormfields(
      setName,
      setEventDate,
      setEventModeValue,
      setCustomCode,
      setEventColor,
      setQrDesign,
    );
    onCancel?.();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: CreateEventFormPayload = {
      name: name.trim(),
      event_mode: eventModeValue,
      event_date: eventDate.trim() === "" ? null : eventDate.trim(),
    };

    if (showDesignFields) {
      if (customCode.trim()) payload.event_code = customCode.trim();
      if (eventColor.trim()) {
        const normalized = normalizeEventColor(eventColor);

        if (!normalized) {
          setEventColorError(
            "Enter a valid color: hex, rgb, hsl, or name like purple",
          );
          return;
        }

        setEventColorError(null);
        payload.event_color = normalized;
      }
      if (showDesignFields && qrDesign !== "basic") payload.qr_design = qrDesign;
    }

    const ok = await onSubmit(payload);

    if (ok) {
      resetFormfields(
        setName,
        setEventDate,
        setEventModeValue,
        setCustomCode,
        setEventColor,
        setQrDesign,
      );
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
        {showDesignFields ? (
          <div className="space-y-4 rounded-lg border border-muted-20 p-4">
            <p className="text-sm text-muted-80">Optional branding</p>
            <div className="space-y-2">
              <Label htmlFor="create-event-code">Custom event code</Label>
              <Input
                id="create-event-code"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="my-friday-set"
                autoCapitalize="off"
                autoCorrect="off"
              />
              <p className="text-xs text-muted-60">
                4–24 characters: lowercase letters, numbers, hyphens. Leave
                blank for an auto code.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-event-color">Event color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="create-event-color"
                  type="color"
                  value={colorPickerValue}
                  onChange={(e) => {
                    setEventColor(e.target.value);
                    setEventColorError(null);
                  }}
                  className="h-10 w-14 p-1 cursor-pointer"
                />

                <Input
                  value={eventColor}
                  onChange={(e) => {
                    setEventColor(e.target.value);
                    setEventColorError(null);
                  }}
                  placeholder="#7c3aed, rgb(124, 58, 237), purple"
                  className="flex-1 font-mono text-sm"
                />
              </div>
                {eventColorError ? (
                  <p className="text-xs text-red-500">{eventColorError}</p>
                ) : (
                  <p className="text-xs text-muted-60">
                    Accepts hex, rgb, hsl, or color names. Saved as hex.
                  </p>
                )}
            </div>
            <div className="space-y-2">
              <LabeledSelect
                id="create-event-qr-design"
                label="QR design"
                value={qrDesign}
                onValueChange={(next) => setQrDesign(next as QrDesignPresetId)}
                options={QR_DESIGN_PRESETS.map((p) => ({
                  value: p.id,
                  label: p.label,
                }))}
              />
            </div>
          </div>
        ) : null}
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
