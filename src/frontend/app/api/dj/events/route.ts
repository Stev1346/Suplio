import { parseCreateDesignFields } from "@/lib/server/custom-event-designs/parse-create-design-fields";
import { isTierAllowedForFeature } from "@/lib/server/tier-gates";
import { featureFlags } from "@/lib/shared/config/feature-flags";
import { EVENT_LIFECYCLE_STATUS, EVENT_MODES, lifecycleStatus } from "@/lib/shared/constants/routes";
import { QrDesignPresetId } from "@/lib/shared/custom-event-designs/qr-presets";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function generateEventCode(length = 8): string {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return code;
}

export async function POST(req: Request) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
        .from("dj_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (profileError || !profile) {
        return NextResponse.json(
            { error: "DJ profile not found" },
            { status: 403 }
        );
    }

    const body = await req.json().catch(() => null);
    const name = String(body?.name ?? "").trim();
    if (!name) {
        return NextResponse.json({ error: "Event name is required" }, { status: 400 })
    }

    const rawMode = body?.event_mode;
    const rawDate = body?.event_date;

    let event_mode: "song_request" | "karaoke" | undefined;
    if (rawMode !== undefined && rawMode !== null && rawMode !== "") {
        const m = String(rawMode).trim();
        if (!(EVENT_MODES as readonly string[]).includes(m)) {
            return NextResponse.json({ error: "Invalid event_mode" }, { status: 400 });
        }
        event_mode = m as "song_request" | "karaoke";
    }

    let event_date: string | null | undefined;
    if (rawDate !== undefined && rawDate !== null && String(rawDate).trim() !== "") {
        const d = String(rawDate).trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
            return NextResponse.json({ error: "Invalid event_date" }, { status: 400 });
        }
        event_date = d;
    } else {
        event_date = undefined;
    }

    const bodyRecord =
        body && typeof body === "object" ? (body as Record<string, unknown>) : null;

    const designParse = parseCreateDesignFields(bodyRecord);

    if (designParse.ok && designParse.hasAny && !featureFlags.customEventDesigns) {
        return NextResponse.json(
            { error: "Custom event designs are not enabled" },
            { status: 403 },
        );
    }

    if (!designParse.ok) {
        return NextResponse.json({ error: designParse.error }, { status: 400 });
    }
    const design = designParse.fields;

    if (designParse.hasAny) {
        const allowed = await isTierAllowedForFeature({
            djId: user.id,
            feature: "custom_event_designs",
        });
        if (!allowed) {
            return NextResponse.json({ error: "Not allowed for your plan" }, { status: 403 });
        }
    }

    const useCustomCode = Boolean(design.customEventCode);
    let eventCode = design.customEventCode ?? generateEventCode(8);

    if (useCustomCode) {
        const { data: existing } = await supabase
            .from("events")
            .select("id")
            .eq("event_code", eventCode)
            .neq("lifecycle_status", lifecycleStatus.lower.archived)
            .maybeSingle();

        if (existing) {
            return NextResponse.json(
                { error: "That event code is already in use" },
                { status: 409 },
            );
        }
    }

    type InsertPayload = {
        name: string;
        event_code: string;
        dj_id: string;
        lifecycle_status: "draft";
        event_mode?: "song_request" | "karaoke";
        event_date?: string;
        event_color?: string | null;
        qr_design?: QrDesignPresetId;
        event_code_edits_remaining?: number;
    };

    const buildPayload = (code: string): InsertPayload => {
        const insertPayload: InsertPayload = {
            name,
            event_code: code,
            dj_id: user.id,
            lifecycle_status: "draft",
        };
        if (event_mode !== undefined) insertPayload.event_mode = event_mode;
        if (event_date !== undefined) insertPayload.event_date = event_date;
        if (design.event_color !== undefined) insertPayload.event_color = design.event_color;
        if (design.qr_design !== undefined) insertPayload.qr_design = design.qr_design;
        if (useCustomCode) insertPayload.event_code_edits_remaining = 2;
        return insertPayload;
    };

    if (useCustomCode) {
        const { data, error } = await supabase
            .from("events")
            .insert(buildPayload(eventCode))
            .select("event_code")
            .single();

        if (!error) {
            return NextResponse.json({ data: { event_code: data.event_code } }, { status: 201 });
        }
        if (error.code === "23505") {
            return NextResponse.json(
                { error: "That event code is already in use" },
                { status: 409 },
            );
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    for (let i = 0; i < 10; i++) {
        const { data, error } = await supabase
            .from("events")
            .insert(buildPayload(eventCode))
            .select("event_code")
            .single();

        if (!error) {
            return NextResponse.json({ data: { event_code: data.event_code } }, { status: 201 });
        }
        if (error.code === "23505") {
            eventCode = generateEventCode(8);
            continue;
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
        { error: "Could not generate unique code. Try again." },
        { status: 500 },
    );
}

export async function GET(req: Request) {
    const supabase = await createClient();

    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? "10")));
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const LIFECYCLES = EVENT_LIFECYCLE_STATUS;
    const lifecycleParam = url.searchParams.get("lifecycle");
    const lifecycle = lifecycleParam && (LIFECYCLES as readonly string[]).includes(lifecycleParam)
        ? (lifecycleParam as typeof LIFECYCLES[number])
        : null;

    let query = supabase.from("events")
        .select("id, name, event_code, allow_requests, created_at, lifecycle_status, event_mode, event_date", { count: "exact" })
        .eq("dj_id", user.id);

    if (lifecycle) {
        query = query.eq("lifecycle_status", lifecycle);
    } else if (lifecycleParam !== "all") {
        query = query.neq("lifecycle_status", "archived");
    }

    const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const total = count ?? 0;

    return NextResponse.json({
        data: {
            page,
            pageSize,
            total,
            hasNextPage: total > page * pageSize,
            items: data ?? []
        }
    });
}