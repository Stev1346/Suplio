import { logDjAction } from "@/lib/server/dj-audit";
import { EVENT_MODES, lifecycleStatus } from "@/lib/shared/constants/routes";
import { createClient } from "@/lib/supabase/server";
import { EventLifecycleStatus, EventMode } from "@/types/database";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ eventId: string }> };

const LIFECYCLE: EventLifecycleStatus[] = [lifecycleStatus.lower.draft, lifecycleStatus.lower.live, lifecycleStatus.lower.ended, lifecycleStatus.lower.archived];

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
        .select("id,dj_id,name,lifecycle_status, event_mode, event_date")
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

    if (name !== undefined && !name) {
        return NextResponse.json({ error: "Event name is required" }, { status: 400 })
    }
    if (
        name === undefined &&
        lifecycle === undefined &&
        event_mode === undefined &&
        event_date === undefined
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

    const { error } = await supabase.from("events").update(patch).eq("id", event.id);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

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

    return NextResponse.json({ ok: true });
}