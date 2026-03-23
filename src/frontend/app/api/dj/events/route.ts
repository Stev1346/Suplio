import { generatePin, hashPin } from "@/lib/server/auth/dashboard-pin";
import { createClient } from "@supabase/supabase-js";
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
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceRole) {
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const body = await req.json().catch(() => null);
    const name = String(body?.name ?? "").trim();
    if (!name) {
        return NextResponse.json({ error: "Event name is required" }, { status: 400 })
    }

    const supabase = createClient(url, serviceRole);

    let eventCode = generateEventCode(8);
    const pin = generatePin(6);
    const djPinHash = hashPin(pin);

    for (let i = 0; i < 10; i++) {
        const { data, error } = await supabase
            .from("events")
            .insert({ name, event_code: eventCode, dj_pin_hash: djPinHash })
            .select("event_code")
            .single();

        if (!error) {
            return NextResponse.json({ data: { event_code: data.event_code, dj_pin: pin } }, {})
        }
        if (error.code === "23505") {
            eventCode = generateEventCode(8);
            continue;
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not generate unique code. Try again." }, { status: 500 });
}