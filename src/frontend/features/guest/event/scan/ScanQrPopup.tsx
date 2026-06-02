"use client";

import { EventQrCode } from "@/components/custom-event-designs/EventQrCode";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EventState } from "@/hooks/guest/useEventByCode";
import { featureFlags } from "@/lib/shared/config/feature-flags";
import { lifecycleStatus } from "@/lib/shared/constants/routes";
import { QrCode } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  event: NonNullable<EventState>;
  eventCode: string;
};

export function ScanQrPopup({ event, eventCode }: Props) {
  const [open, setOpen] = useState(false);

  if (!featureFlags.customEventDesigns) return null;
  if (event.lifecycle_status !== lifecycleStatus.lower.live) return null;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const requestUrl = `${baseUrl}/event/${eventCode}/request`;

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(requestUrl);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"secondary"}
          size={"sm"}
          aria-label="Show Event QR code"
          className="rounded-full bg-background shadow-lg"
        >
          <QrCode />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col items-center gap-4 motion-reduce:animate-none  motion-reduce:transition-none">
        <DialogTitle>Scan to request a song</DialogTitle>
        <DialogDescription className="text-center">
          Point a camera at the code to open {event.name}
        </DialogDescription>
        <div className="rounded-xl bg-white p-4 shadow">
          <EventQrCode
            value={requestUrl}
            size={220}
            eventColor={event.event_color}
            qrDesign={event.qr_design}
            variant="display"
          />
        </div>
        <Button
          variant="secondary"
          onClick={handleCopyUrl}
          className="break-all"
        >
          Copy Link
        </Button>
      </DialogContent>
    </Dialog>
  );
}
