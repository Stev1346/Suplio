import { logDjAction } from "@/lib/server/dj-audit";
import { lifecycleStatus } from "@/lib/shared/constants/routes";
import { createClient } from "@/lib/supabase/server";
import { EventLifecycleStatus } from "@/types/database";
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
        .select("id,dj_id,name,lifecycle_status")
        .eq("id", eventId)
        .single();

    if (eventError || !event || event.dj_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : undefined;
    const lifecycle = body?.lifecycle_status as EventLifecycleStatus | undefined;

    if (name !== undefined && !name) {
        return NextResponse.json({ error: "Event name is required" }, { status: 400 })
    }
    if (lifecycle !== undefined && !LIFECYCLE.includes(lifecycle)) {
        return NextResponse.json({ error: "Invalid lifecycle status" }, { status: 400 });
    }
    if (name === undefined && lifecycle === undefined) {
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
        }
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