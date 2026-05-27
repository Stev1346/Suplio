import { colord, extend } from "colord";
import namesPlugin from "colord/plugins/names";

extend([namesPlugin]);

export const EVENT_COLOR_STORAGE_FORMAT = /^#[0-9a-f]{6}$/;

/**
 * Parses common CSS color strings and returns canonical `#rrggbb`, or null if invalid.
 * Rejects transparent and non-opaque colors (alpha < 1).
 */
export function normalizeEventColor(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parsed = colord(trimmed);
  if (!parsed.isValid()) return null;

  // Brand accent must be opaque
  if (parsed.alpha() < 1) return null;

  const hex = parsed.toHex(); // e.g. "#7c3aed"
  return EVENT_COLOR_STORAGE_FORMAT.test(hex) ? hex : null;
}