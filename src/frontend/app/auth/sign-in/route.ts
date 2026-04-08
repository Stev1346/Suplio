
import { checkLoginAllowed, recordLoginFailure, resetLoginAttempts } from "@/lib/server/auth/login-rate-limit";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function clientIp(req: Request): string{
    const xff = req.headers.get("x-forwarded-for");

    if(xff) return xff.split(",")[0].trim();

    return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
        return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
    }

    const key = `${email}:${clientIp(req)}`;
    const throttle = checkLoginAllowed(key);
    if(!throttle.ok){
        return NextResponse.json(
            {error: throttle.message},
            {
                status: throttle.status,
                headers: {"Retry-After": String(throttle.retryAfterSec)}
            }
        )
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        recordLoginFailure(key);
        return NextResponse.json({ error: error.message }, { status: 401 })
    }

    resetLoginAttempts(key);
    return NextResponse.json({ ok: true })
}