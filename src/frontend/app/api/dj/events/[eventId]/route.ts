import { logDjAction } from "@/lib/server/dj-audit";
import { isTierAllowedForFeature } from "@/lib/server/tier-gates";
import { featureFlags } from "@/lib/shared/config/feature-flags";
import { EVENT_MODES, lifecycleStatus } from "@/lib/shared/constants/routes";
import { EVENT_CODE_RULES, validateEventCode } from "@/lib/shared/custom-event-designs/event-code-rules";
import { normalizeEventColor } from "@/lib/shared/custom-event-designs/normalize-event-color";
import { QR_DESIGN_PRESETS } from "@/lib/shared/custom-event-designs/qr-presets";
import { createClient } from "@/lib/supabase/server";
import { EventLifecycleStatus, EventMode, QrDesignPresetId } from "@/types/database";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ eventId: string }> };

const LIFECYCLE: EventLifecycleStatus[] = [lifecycleStatus.lower.draft, lifecycleStatus.lower.live, lifecycleStatus.lower.ended, lifecycleStatus.lower.archived];
const QR_DESIGN_IDS = new Set<string>(QR_DESIGN_PRESETS.map((preset) => preset.id));

export async function PATCH(req: Request, context: RouteContext) {
    const { eventId } = await context.params;
    if (!eventId) {
        return NextResponse.json({ error: "Missing event" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: event, error: eventError } = await supabase
        .from("events")
        .select(
            "id,dj_id,name,lifecycle_status,event_mode,event_date,event_code,event_color,qr_design,event_code_edits_remaining",
        )
        .eq("id", eventId)
        .single();

    if (eventError || !event || event.dj_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : undefined;

    const rawLifecycle = body?.lifecycle_status;
    let lifecycle: EventLifecycleStatus | undefined;
    if (rawLifecycle === undefined) {
        lifecycle = undefined;
    } else if (typeof rawLifecycle !== "string") {
        return NextResponse.json({ error: "Invalid lifecycle status" }, { status: 400 });
    } else {
        const trimmed = rawLifecycle.trim();
        if (!LIFECYCLE.includes(trimmed as EventLifecycleStatus)) {
            return NextResponse.json({ error: "Invalid lifecycle status" }, { status: 400 });
        }
        lifecycle = trimmed as EventLifecycleStatus;
    }

    const rawEventMode = body?.event_mode;
    let event_mode: EventMode | undefined;
    if (rawEventMode !== undefined && rawEventMode !== null && rawEventMode !== "") {
        const m = String(rawEventMode).trim();
        if (!(EVENT_MODES as readonly string[]).includes(m)) {
            return NextResponse.json({ error: "Invalid event_mode" }, { status: 400 });
        }
        event_mode = m as EventMode;
    }

    const rawEventDate = body?.event_date;
    let event_date: string | null | undefined;
    if (rawEventDate === null) {
        event_date = null;
    } else if (rawEventDate !== undefined && String(rawEventDate).trim() !== "") {
        const d = String(rawEventDate).trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
            return NextResponse.json({ error: "Invalid event_date" }, { status: 400 });
        }
        event_date = d;
    } else {
        event_date = undefined;
    }

    const hasDesignPatch =
        body &&
        typeof body === "object" &&
        ("event_code" in body || "event_color" in body || "qr_design" in body);

    if (hasDesignPatch && !featureFlags.customEventDesigns) {
        return NextResponse.json(
            { error: "Custom event designs are not enabled" },
            { status: 403 },
        );
    }

    if (hasDesignPatch) {
        const allowed = await isTierAllowedForFeature({
            djId: user.id,
            feature: "custom_event_designs",
        });

        if (!allowed) {
            return NextResponse.json(
                { error: "Not allowed for your plan" },
                { status: 403 },
            );
        }
    }

    let nextEventCode: string | undefined;
    let codeChanged = false;

    if (body?.event_code !== undefined) {
        if (typeof body.event_code !== "string") {
            return NextResponse.json({ error: "Invalid event code" }, { status: 400 });
        }

        const normalized = EVENT_CODE_RULES.normalize(body.event_code);
        const codeError = validateEventCode(normalized);

        if (codeError) {
            return NextResponse.json({ error: codeError }, { status: 400 });
        }

        if (normalized !== event.event_code) {
            if (event.event_code_edits_remaining <= 0) {
                return NextResponse.json(
                    { error: "No custom code edits remaining" },
                    { status: 400 },
                );
            }

            const { data: existing } = await supabase
                .from("events")
                .select("id")
                .eq("event_code", normalized)
                .neq("id", event.id)
                .neq("lifecycle_status", lifecycleStatus.lower.archived)
                .maybeSingle();

            if (existing) {
                return NextResponse.json(
                    { error: "That event code is already in use" },
                    { status: 409 },
                );
            }

            nextEventCode = normalized;
            codeChanged = true;
        }
    }

    let nextEventColor: string | null | undefined;

    if (body?.event_color !== undefined) {
        if (body.event_color === null || String(body.event_color).trim() === "") {
            nextEventColor = null;
        } else {
            const normalized = normalizeEventColor(String(body.event_color));
            if (!normalized) {
                return NextResponse.json(
                    { error: "Enter a valid color (hex, rgb, hsl, or name like purple)" },
                    { status: 400 },
                );
            }

            nextEventColor = normalized;
        }

        if (nextEventColor === event.event_color) {
            nextEventColor = undefined;
        }
    }

    let nextQrDesign: QrDesignPresetId | undefined;

    if (body?.qr_design !== undefined) {
        const qrDesign = String(body.qr_design).trim();

        if (!QR_DESIGN_IDS.has(qrDesign)) {
            return NextResponse.json({ error: "Invalid QR design" }, { status: 400 });
        }

        if (qrDesign !== event.qr_design) {
            nextQrDesign = qrDesign as QrDesignPresetId;
        }
    }

    if (name !== undefined && !name) {
        return NextResponse.json({ error: "Event name is required" }, { status: 400 })
    }

    if (
        name === undefined &&
        lifecycle === undefined &&
        event_mode === undefined &&
        event_date === undefined &&
        !codeChanged &&
        nextEventColor === undefined &&
        nextQrDesign === undefined
    ) {
        return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = name;

    if (lifecycle !== undefined) {
        patch.lifecycle_status = lifecycle;

        if (lifecycle !== lifecycleStatus.lower.live) {
            patch.allow_requests = false;
        }

        if (lifecycle === lifecycleStatus.lower.live &&
            event.lifecycle_status !== lifecycleStatus.lower.live) {
            patch.allow_requests = true;
            patch.live_entered_at = new Date().toISOString();
            patch.ended_entered_at = null;
        }
        if (
            lifecycle === lifecycleStatus.lower.ended &&
            event.lifecycle_status !== lifecycleStatus.lower.ended
        ) {
            patch.ended_entered_at = new Date().toISOString();
        }
        if (lifecycle === lifecycleStatus.lower.draft) {
            patch.live_entered_at = null;
            patch.ended_entered_at = null;
        }
    }

    if (event_mode !== undefined) {
        patch.event_mode = event_mode;
    }
    if (event_date !== undefined) {
        patch.event_date = event_date;
    }

    if (codeChanged && nextEventCode) {
        patch.event_code = nextEventCode;
        patch.event_code_edits_remaining = event.event_code_edits_remaining - 1;
    }
    if (nextEventColor !== undefined) {
        patch.event_color = nextEventColor;
    }
    if (nextQrDesign !== undefined) {
        patch.qr_design = nextQrDesign;
    }

    const { data: updated, error } = await supabase
        .from("events")
        .update(patch)
        .eq("id", event.id)
        .select(
            "id,name,event_code,allow_requests,lifecycle_status,event_mode,event_date,event_color,qr_design,event_code_edits_remaining",
        )
        .single();

    if (error || !updated) {
        return NextResponse.json(
            { error: error?.message ?? "Could not update event" },
            { status: 400 },
        );
    }

    if (
        name !== undefined ||
        lifecycle !== undefined ||
        event_mode !== undefined ||
        event_date !== undefined
    ) {
        await logDjAction({
            djId: user.id,
            action: "event.updated",
            eventId: event.id,
            metadata: {
                prev_name: event.name,
                next_name: name ?? event.name,
                prev_lifecycle_status: event.lifecycle_status,
                next_lifecycle_status: lifecycle ?? event.lifecycle_status,
            },
        });
    }

    if (codeChanged && nextEventCode) {
        await logDjAction({
            djId: user.id,
            action: "event_code_changed",
            eventId: event.id,
            metadata: {
                eventId: event.id,
                field: "event_code",
                previousValue: event.event_code,
                nextValue: nextEventCode,
                editsRemainingAfter: updated.event_code_edits_remaining,
            },
        });
    }

    if (nextEventColor !== undefined) {
        await logDjAction({
            djId: user.id,
            action: "event_color_changed",
            eventId: event.id,
            metadata: {
                eventId: event.id,
                field: "event_color",
                previousValue: event.event_color,
                nextValue: nextEventColor,
            },
        });
    }

    if (nextQrDesign !== undefined) {
        await logDjAction({
            djId: user.id,
            action: "event_qr_design_changed",
            eventId: event.id,
            metadata: {
                eventId: event.id,
                field: "qr_design",
                previousValue: event.qr_design,
                nextValue: nextQrDesign,
            },
        });
    }

    return NextResponse.json({ data: updated });
}