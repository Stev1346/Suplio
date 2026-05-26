
import {
    EVENT_CODE_RULES,
    validateEventCode,
} from "@/lib/shared/custom-event-designs/event-code-rules";
import { normalizeEventColor } from "@/lib/shared/custom-event-designs/normalize-event-color";
import {
    QR_DESIGN_PRESETS,
    type QrDesignPresetId,
} from "@/lib/shared/custom-event-designs/qr-presets";

const QR_IDS = new Set<string>(QR_DESIGN_PRESETS.map((p) => p.id));

export type ParsedCreateDesignFields = {
    customEventCode?: string;
    event_color?: string | null;
    qr_design?: QrDesignPresetId;
};

function hasDesignPayload(body: Record<string, unknown>): boolean {
    const code = body?.event_code;
    const color = body?.event_color;
    const qr = body?.qr_design;
    return (
        (code !== undefined && code !== null && String(code).trim() !== "") ||
        (color !== undefined && color !== null && String(color).trim() !== "") ||
        (qr !== undefined && qr !== null && String(qr).trim() !== "")
    );
}

export function parseCreateDesignFields(
    body: Record<string, unknown> | null,
): { ok: true; fields: ParsedCreateDesignFields; hasAny: boolean } | { ok: false; error: string } {
    if (!body || !hasDesignPayload(body)) {
        return { ok: true, fields: {}, hasAny: false };
    }

    const fields: ParsedCreateDesignFields = {};

    const rawCode = body.event_code;
    if (rawCode !== undefined && rawCode !== null && String(rawCode).trim() !== "") {
        const codeError = validateEventCode(String(rawCode));
        if (codeError) return { ok: false, error: codeError };
        fields.customEventCode = EVENT_CODE_RULES.normalize(String(rawCode));
    }

    const rawColor = body.event_color;
    if (rawColor !== undefined && rawColor !== null && String(rawColor).trim() !== "") {
        const normalized = normalizeEventColor(String(rawColor).trim());
        if (!normalized) {
            return { ok: false, error: "Enter a valid color (hex, rgb, hsl, or name like purple)" };
        }
        fields.event_color = normalized; // always "#rrggbb"
    }

    const rawQr = body.qr_design;
    if (rawQr !== undefined && rawQr !== null && String(rawQr).trim() !== "") {
        const id = String(rawQr).trim();
        if (!QR_IDS.has(id)) {
            return { ok: false, error: "Invalid QR design" };
        }
        fields.qr_design = id as QrDesignPresetId;
    }

    return { ok: true, fields, hasAny: true };
}