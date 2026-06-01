import { colord, extend } from "colord";
import a11yPlugin from "colord/plugins/a11y";
import { normalizeEventColor } from "./normalize-event-color";
import { EVENT_COLOR_POLICY } from "./color-policy";

extend([a11yPlugin]);

const DEFAULT_FG = "#000000";
const DISPLAY_BG = "#ffffff";
const EXPORT_BG = "transparent";
const QR_MIN_CONTRAST = 3.0;

export type QrColorVariant = "display" | "export";

export type ResolvedQrColors = { fgColor: string; bgColor: string; };

export function resolveQrColors(
    eventColor: string | null | undefined,
    variant: QrColorVariant,
    options?: { useCustomColor?: boolean }
): ResolvedQrColors {
    const bgColor = variant === "export" ? EXPORT_BG : DISPLAY_BG;

    if (!options?.useCustomColor) {
        return { fgColor: DEFAULT_FG, bgColor };
    }

    const hex = eventColor ? normalizeEventColor(eventColor) : null;
    if (!hex || !EVENT_COLOR_POLICY.storageFormat.test(hex)) {
        return { fgColor: DEFAULT_FG, bgColor };
    }

    const fgColor = colord(hex).contrast(DISPLAY_BG) >= QR_MIN_CONTRAST
        ? hex : EVENT_COLOR_POLICY.fallbackAccent;

    return { fgColor, bgColor };
}