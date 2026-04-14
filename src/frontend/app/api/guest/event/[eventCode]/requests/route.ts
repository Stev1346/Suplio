import { getClientIp } from "@/lib/server/client-ip";
import { attachGuestCookie, getOrMintGuestSession } from "@/lib/server/guest-cookie";
import { submitGuestRequest } from "@/lib/server/guest/submit-request";
import { createAdminSupabase } from "@/lib/server/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ eventCode: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
    const { eventCode } = await context.params;

    const body = await req.json().catch(() => null);
    const songName = typeof body?.song_name === "string" ? body.song_name.trim() : "";
    const artist = typeof body?.artist === "string" ? body.artist.trim() : null;
    const message = typeof body?.message === "string" ? body.message.trim() : null;
    const supabase = createAdminSupabase();

    if (!eventCode || !songName) {
        return NextResponse.json({ error: "Missing event code or song name" }, { status: 400 });
    }

    let guestSession: { voterId: string; cookieToSet?: string };
    try {
        guestSession = getOrMintGuestSession(req);
    } catch {
        return NextResponse.json(
            { error: "Server configuration error" },
            { status: 500 },
        );
    }

    const rateKey = `${getClientIp(req)}:${guestSession.voterId}:${eventCode}`;
    const { data, error } = await supabase.rpc("consume_rate_limit", {
        p_key: rateKey,
        p_window_seconds: 60,
        p_max_hits: 1,
    });

    if (error) {
        return attachGuestCookie(
          NextResponse.json(
            { error: "Rate-limit service unavailable. Please try again." },
            { status: 500 },
          ),
          guestSession,
        );
      }
      if (!data?.[0]?.ok) {
        const retryAfterSec = data?.[0]?.retry_after_sec ?? 60;
        return attachGuestCookie(
          NextResponse.json(
            { error: "Please wait before trying again." },
            { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
          ),
          guestSession,
        );
      }

    const result = await submitGuestRequest({
        eventCode,
        songName,
        artist,
        message
    });

    const response = result.ok
        ? NextResponse.json({ ok: true })
        : NextResponse.json({ error: result.error }, { status: result.status });

    return attachGuestCookie(response, guestSession);
}