import { getClientIp } from "@/lib/server/client-ip";
import { getOrMintGuestSession, GUEST_COOKIE_NAME, guestCookieOptions } from "@/lib/server/guest-cookie";
import { submitGuestRequest } from "@/lib/server/guest/submit-request";
import { consumeRequestRateLimit } from "@/lib/server/request-rate-limit";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ eventCode: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
    const { eventCode } = await context.params;

    const body = await req.json().catch(() => null);
    const songName = typeof body?.song_name === "string" ? body.song_name.trim() : "";
    const artist = typeof body?.artist === "string" ? body.artist.trim() : null;
    const message = typeof body?.message === "string" ? body.message.trim() : null;

    if (!eventCode || !songName) {
        return NextResponse.json({ error: "Missing event code or song name" }, { status: 400 });
    }

    let guest: { voterId: string; cookieToSet?: string };
    try {
        guest = getOrMintGuestSession(req);
    } catch {
        return NextResponse.json(
            { error: "Server configuration error" },
            { status: 500 },
        );
    }

    const rateKey = `${getClientIp(req)}:${guest.voterId}:${eventCode}`;
    const limit = consumeRequestRateLimit(rateKey);

    if (!limit.ok) {
        return NextResponse.json(
            { error: limit.message },
            { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
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

    if (guest.cookieToSet) {
        response.cookies.set(GUEST_COOKIE_NAME, guest.cookieToSet, guestCookieOptions());
    }

    return response;
}