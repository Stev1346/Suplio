import { EVENT_LIFECYCLE_STATUS } from "@/lib/shared/constants/routes";
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

    let eventCode = generateEventCode(8);

    for (let i = 0; i < 10; i++) {
        const { data, error } = await supabase
            .from("events")
            .insert({ name, event_code: eventCode, dj_id: user.id, lifecycle_status: "draft" })
            .select("event_code")
            .single();

        if (!error) {
            return NextResponse.json({ data: { event_code: data.event_code } }, { status: 201 })
        }
        if (error.code === "23505") {
            eventCode = generateEventCode(8);
            continue;
        }
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Could not generate unique code. Try again." }, { status: 500 });
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
        .select("id, name, event_code, allow_requests, created_at, lifecycle_status", { count: "exact" })
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