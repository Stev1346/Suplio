import { describe, expect, it } from "vitest";
import {
  guestEventHueVars,
  hexToHue,
  resolveGuestEventHue,
  resolveGuestEventTheme,
} from "@/lib/shared/custom-event-designs/resolve-guest-event-theme";

describe("resolveGuestEventTheme", () => {
  it("returns null for a missing color", () => {
    expect(resolveGuestEventTheme(null)).toBeNull();
    expect(resolveGuestEventTheme(undefined)).toBeNull();
  });

  it("returns null for an invalid color", () => {
    expect(resolveGuestEventTheme("not-a-color")).toBeNull();
  });

  it("exposes the per-surface guest CSS custom properties for a valid color", () => {
    const theme = resolveGuestEventTheme("#7c3aed");
    expect(theme).not.toBeNull();

    const vars = theme!.cssVars as Record<string, string | number>;
    expect(vars["--hue"]).toBe(hexToHue("#7c3aed"));
    expect(vars["--guest-primary-button"]).toBeTruthy();
    expect(vars["--guest-heading-accent"]).toBeTruthy();
    expect(vars["--guest-focus-ring"]).toBeTruthy();
    expect(vars["--guest-badge-accent"]).toBeTruthy();
  });

  it("engages the platform fallback hue on a surface that fails contrast", () => {
    // White fails the primary-button (on white) text-contrast threshold, so it
    // falls back to the platform default hue (170 -> accent hue 230).
    const theme = resolveGuestEventTheme("#ffffff");
    expect(theme).not.toBeNull();

    const vars = theme!.cssVars as Record<string, string | number>;
    expect(vars["--guest-primary-button"]).toBe("hsl(230 50% 60%)");
  });
});

describe("resolveGuestEventHue", () => {
  it("returns a finite hue for a valid color", () => {
    const hue = resolveGuestEventHue("#7c3aed");
    expect(hue).not.toBeNull();
    expect(Number.isFinite(hue!)).toBe(true);
  });

  it("returns null for an invalid color", () => {
    expect(resolveGuestEventHue("nope")).toBeNull();
  });
});

describe("guestEventHueVars", () => {
  it("builds the base hue-derived variables", () => {
    const vars = guestEventHueVars(200) as Record<string, string | number>;
    expect(vars["--hue"]).toBe(200);
    expect(vars["--background"]).toBe("hsl(200 50% 10%)");
  });
});
