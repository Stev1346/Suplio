"use client";

import { featureFlags } from "@/lib/shared/config/feature-flags";
import { QrColorVariant, resolveQrColors } from "@/lib/shared/custom-event-designs/resolve-qr-colors";
import { cn } from "@/lib/utils";
import { QrDesignPresetId } from "@/types/database";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";

type EventQrCodeProps = {
  value: string;
  size: number;
  eventColor?: string | null;
  qrDesign?: QrDesignPresetId;
  variant: QrColorVariant;
  className?: string;
};

function QrDesignShell({ 
    preset, 
    children, 
    size 
}: {
    preset: QrDesignPresetId; 
    children: React.ReactNode; 
    size: number;
}) {
  switch (preset) {
    case "rounded":
      return (
        <div
          className="overflow-hidden rounded-2xl"
          style={{ width: size, height: size }}
        >
          {children}
        </div>
      );
    case "bold":
      return (
        <div
          className="ring-4 ring-accent-40 p-3 shadow-sm rounded-xl"
          style={{ width: size + 24, height: size + 24 }}
        >
          {children}
        </div>
      );
    case "frame":
      return (
        <div
          className="rounded-lg bg-white p-2 shadow-md ring-4 ring-black/10"
        >
          {children}
        </div>
      );

    default:
        return <>{children}</>
      break;
  }
}

export function EventQrCode({
    value, 
    size, 
    eventColor, 
    qrDesign="basic", 
    variant, 
    className
}: EventQrCodeProps) {
    const useCustomColor = featureFlags.customEventDesigns && Boolean(eventColor?.trim());
    const {fgColor, bgColor} = resolveQrColors(eventColor, variant, {useCustomColor});

    const qr = variant === "display" ? (
        <QRCodeSVG value={value} size={size} level="M" fgColor={fgColor} bgColor={bgColor} />
    ) : (
        <QRCodeCanvas value={value} size={size} level="M" fgColor={fgColor} bgColor={bgColor} />
    );

    return(
        <div className={cn("inline-flex", className)}>
            <QrDesignShell preset={qrDesign} size={size}>
                {qr}
            </QrDesignShell>
        </div>
    )
}