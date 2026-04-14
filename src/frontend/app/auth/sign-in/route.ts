
import { checkLoginAllowed, recordLoginFailure, resetLoginAttempts } from "@/lib/server/auth/login-rate-limit";
import { getClientIp } from "@/lib/server/client-ip";
import { consumeRateLimit } from "@/lib/server/consume-rate-limit";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
        return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
    }

    const key = `auth:login:${email}:${getClientIp(req)}`;
    const shortWindow = await consumeRateLimit(`${key}:15m`, 15 * 60, 5);
    if (shortWindow.rpcError) {
        return NextResponse.json(
            { error: "Rate-limit service unavailable. Please try again." },
            { status: 500 }
        );
    }
    if (!shortWindow.ok) {
        return NextResponse.json(
            { error: "Too many attempts. Please wait before trying again." },
            {
                status: 429,
                headers: { "Retry-After": String(shortWindow.retryAfterSec ?? 60) },
            }
        );
    }

    const longWindow = await consumeRateLimit(`${key}:60m`, 60 * 60, 10);
    if (longWindow.rpcError) {
        return NextResponse.json(
            { error: "Rate-limit service unavailable. Please try again." },
            { status: 500 }
        );
    }
    if (!longWindow.ok) {
        return NextResponse.json(
            { error: "Too many attempts. Try again in 30 minutes." },
            {
                status: 429,
                headers: { "Retry-After": String(longWindow.retryAfterSec ?? 1800) },
            }
        );
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json({ ok: true })
}