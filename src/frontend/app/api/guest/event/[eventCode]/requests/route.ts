import { getClientIp } from "@/lib/server/client-ip";
import { createGuestRouteContext } from "@/lib/server/guest-route-response";
import { submitGuestRequest } from "@/lib/server/guest/submit-request";
import { createAdminSupabase } from "@/lib/server/supabase-admin";
import { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ eventCode: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const { eventCode } = await context.params;

  const body = await req.json().catch(() => null);
  const songName = typeof body?.song_name === "string" ? body.song_name.trim() : "";
  const artist = typeof body?.artist === "string" ? body.artist.trim() : null;
  const message = typeof body?.message === "string" ? body.message.trim() : null;
  const supabase = createAdminSupabase();

  const guest = createGuestRouteContext(req);
  if (!guest.ok) return guest.response;

  const { guestSession, json } = guest;

  if (!eventCode || !songName) {
    return json({ error: "Missing event code or song name" }, { status: 400 });
  }

  const rateKey = `${getClientIp(req)}:${guestSession.voterId}:${eventCode}`;
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_key: rateKey,
    p_window_seconds: 60,
    p_max_hits: 1,
  });

  if (error) {
    return json(
      { error: "Rate-limit service unavailable. Please try again." },
      { status: 500 },
    )
  }
  if (!data?.[0]?.ok) {
    const retryAfterSec = data?.[0]?.retry_after_sec ?? 60;
    return json(
      { error: "Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
    )
  }

  const result = await submitGuestRequest({
    eventCode,
    songName,
    artist,
    message
  });

  if(result.ok) return json({ok: true});
  
  return json({error: result.error}, {status: result.status});
}