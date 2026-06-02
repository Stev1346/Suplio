import { EventQrCode } from "@/components/custom-event-designs/EventQrCode";
import { Button } from "@/components/ui/Button";
import { downloadEventQrPng } from "@/lib/client/download-event-qr-png";
import { featureFlags } from "@/lib/shared/config/feature-flags";
import { routes } from "@/lib/shared/constants/routes";
import { QrDesignPresetId } from "@/types/database";
import Link from "next/link";
import { useRef } from "react";
import toast from "react-hot-toast";

type CreatedEventInfoProps = {
  createdCode: string;
  eventColor?: string | null;
  qrDesign?: QrDesignPresetId;
  title?: string;
};

export default function CreatedEventInfo({
  createdCode,
  eventColor,
  qrDesign = "basic",
  title = "Event info"
}: CreatedEventInfoProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const requestUrl = `${baseUrl}/event/${createdCode}/request`;
  const exportQrRef = useRef<HTMLDivElement>(null);

  async function handleCopyUrl() {
    if (!requestUrl) return;

    try {
      await navigator.clipboard.writeText(requestUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link.");
    }
  }

  function handleDownloadQr() {
    const canvas = exportQrRef.current?.querySelector("canvas");
    if (!canvas) {
      toast.error("Could not prepare QR for download");
      return;
    }

    try {
      downloadEventQrPng(canvas, createdCode);
      toast.success("QR downloaded.");
    } catch {
      toast.error("Could not download QR.");
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-secondary-60">
        Share this link or QR code with guests:
      </p>
      <Button
        variant="secondary"
        onClick={handleCopyUrl}
        className="px-4 py-2 rounded break-all mb-6"
      >
        {requestUrl}
      </Button>

      {featureFlags.customEventDesigns ? (
        <>
          <div className="rounded-xl bg-white p-4 shadow mb-3">
            <EventQrCode
              value={requestUrl}
              size={200}
              eventColor={eventColor}
              qrDesign={qrDesign}
              variant="display"
            />
          </div>
          <Button
            variant={"outline"}
            onClick={handleDownloadQr}
            className="mb-5"
          >
            Download QR (PNG)
          </Button>

          <div ref={exportQrRef} className="sr-only" aria-hidden>
            <EventQrCode
              value={requestUrl}
              size={960}
              eventColor={eventColor}
              qrDesign={qrDesign}
              variant="export"
            />
          </div>
        </>
      ) : null}

      <div className="flex gap-4">
        <Button asChild>
          <Link target="_blank" href={routes.guest.eventLanding(createdCode)}>
            Open guest page
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link target="_blank" href={routes.dj.eventDetailByCode(createdCode)}>Open DJ page</Link>
        </Button>
      </div>
    </div>
  );
}
