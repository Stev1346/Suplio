import { describe, expect, it } from "vitest";
import { eventQrPngFilename } from "@/lib/client/download-event-qr-png";

describe("eventQrPngFilename", () => {
  it("follows the suplio-qr-{eventCode}.png pattern", () => {
    expect(eventQrPngFilename("demo")).toBe("suplio-qr-demo.png");
  });

  it("interpolates the given event code verbatim", () => {
    expect(eventQrPngFilename("my-event-1")).toBe("suplio-qr-my-event-1.png");
  });
});
