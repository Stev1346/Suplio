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
            .insert({ name, event_code: eventCode, dj_id: user.id })
            .select("event_code")
            .single();

        if (!error) {
            const code = data?.event_code ?? eventCode;
            return NextResponse.json({ data: { event_code: code } }, { status: 201 })
        }
        if (error.code === "23505") {
            eventCode = generateEventCode(8);
            continue;
        }
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Could not generate unique code. Try again." }, { status: 500 });
}