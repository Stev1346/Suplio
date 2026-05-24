const EXPORT_SIZE = 1024;
const QUIET_ZONE_PX = 32;
const QR_DRAW_SIZE = EXPORT_SIZE - QUIET_ZONE_PX * 2;

export function eventQrPngFilename(eventCode: string): string {
  return `suplio-qr-${eventCode}.png`;
}

export function downloadEventQrPng(
  sourceCanvas: HTMLCanvasElement,
  eventCode: string,
  options?: { backgroundColor?: string | "transparent" }
): void {
  const out = document.createElement("canvas");
  out.width = EXPORT_SIZE;
  out.height = EXPORT_SIZE;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Could not initialize canvas");

  if (options?.backgroundColor) {
    ctx.fillStyle = options?.backgroundColor;
    ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
  }
  ctx.drawImage(
    sourceCanvas,
    QUIET_ZONE_PX,
    QUIET_ZONE_PX,
    QR_DRAW_SIZE,
    QR_DRAW_SIZE,
  );

  out.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = eventQrPngFilename(eventCode);
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}