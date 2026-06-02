import { describe, expect, it } from "vitest";
import { normalizeEventColor } from "@/lib/shared/custom-event-designs/normalize-event-color";

describe("normalizeEventColor", () => {
  it("canonicalizes uppercase hex to lowercase #rrggbb", () => {
    expect(normalizeEventColor("#7C3AED")).toBe("#7c3aed");
  });

  it("resolves CSS color names to hex", () => {
    expect(normalizeEventColor("purple")).toBe("#800080");
  });

  it("converts rgb() input to hex", () => {
    expect(normalizeEventColor("rgb(124, 58, 237)")).toBe("#7c3aed");
  });

  it("returns null for an empty string", () => {
    expect(normalizeEventColor("")).toBeNull();
    expect(normalizeEventColor("   ")).toBeNull();
  });

  it("returns null for an unparseable color", () => {
    expect(normalizeEventColor("not-a-color")).toBeNull();
  });

  it("rejects non-opaque colors (alpha < 1)", () => {
    expect(normalizeEventColor("rgba(0, 0, 0, 0.5)")).toBeNull();
  });
});
