import { describe, expect, it } from "vitest";
import { resolveQrColors } from "@/lib/shared/custom-event-designs/resolve-qr-colors";
import { EVENT_COLOR_POLICY } from "@/lib/shared/custom-event-designs/color-policy";

describe("resolveQrColors", () => {
  it("uses black-on-white for the display variant when custom color is off", () => {
    expect(resolveQrColors("#7c3aed", "display")).toEqual({
      fgColor: "#000000",
      bgColor: "#ffffff",
    });
  });

  it("uses a transparent background for the export variant", () => {
    expect(resolveQrColors("#7c3aed", "export")).toEqual({
      fgColor: "#000000",
      bgColor: "transparent",
    });
  });

  it("applies a sufficiently dark custom color as the foreground", () => {
    expect(
      resolveQrColors("#111111", "display", { useCustomColor: true }),
    ).toEqual({ fgColor: "#111111", bgColor: "#ffffff" });
  });

  it("falls back to the platform accent when the custom color is too light to scan", () => {
    expect(
      resolveQrColors("#fefefe", "display", { useCustomColor: true }),
    ).toEqual({
      fgColor: EVENT_COLOR_POLICY.fallbackAccent,
      bgColor: "#ffffff",
    });
  });

  it("ignores a missing custom color and stays black", () => {
    expect(
      resolveQrColors(null, "display", { useCustomColor: true }),
    ).toEqual({ fgColor: "#000000", bgColor: "#ffffff" });
  });
});
