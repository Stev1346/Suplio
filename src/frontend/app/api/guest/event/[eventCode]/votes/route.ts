import {
  GUEST_COOKIE_NAME,
  getOrMintGuestSession,
  guestCookieOptions,
} from "@/lib/server/guest-cookie";
import { getClientIp } from "@/lib/server/client-ip";
import { consumeVoteRateLimit } from "@/lib/server/vote-rate-limit";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ eventCode: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const { eventCode } = await context.params;
  if (!eventCode) {
    return NextResponse.json({ error: "Missing event" }, { status: 400 });
  }

  const rateKey = `${getClientIp(req)}:${eventCode}`;
  const burst = consumeVoteRateLimit(rateKey);
  if (!burst.ok) {
    return NextResponse.json(
      { error: burst.message },
      {
        status: 429,
        headers: { "Retry-After": String(burst.retryAfterSec) },
      }
    );
  }

  let guestSession: { voterId: string; cookieToSet?: string };
  try {
    guestSession = getOrMintGuestSession(req);
  } catch {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const requestId = body?.request_id;
  const action = body?.action;

  if (!requestId || !action || !["add", "remove"].includes(action)) {
    return NextResponse.json(
      { error: "Missing request_id or action" },
      { status: 400 }
    );
  }

  const voterId = guestSession.voterId;
  const supabase = createClient(url, serviceRoleKey);

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("event_code", eventCode)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const { data: reqRow, error: reqError } = await supabase
    .from("requests")
    .select("id, event_id")
    .eq("id", requestId)
    .single();

  if (reqError || !reqRow || reqRow.event_id !== event.id) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const jsonResponse = (init: { status?: number; body: object }) => {
    const res = NextResponse.json(init.body, { status: init.status ?? 200 });
    if (guestSession.cookieToSet) {
      res.cookies.set(
        GUEST_COOKIE_NAME,
        guestSession.cookieToSet,
        guestCookieOptions()
      );
    }
    return res;
  };

  if (action === "add") {
    const { data: existing } = await supabase
      .from("votes")
      .select("id")
      .eq("request_id", requestId)
      .eq("voter_id", voterId)
      .maybeSingle();

    if (existing) {
      return jsonResponse({
        status: 409,
        body: { error: "Already voted", data: { id: existing.id } },
      });
    }

    const { data, error } = await supabase
      .from("votes")
      .insert({ request_id: requestId, voter_id: voterId })
      .select("id")
      .single();

    if (error) {
      return jsonResponse({ status: 400, body: { error: error.message } });
    }
    return jsonResponse({ body: { data: { id: data.id } } });
  }

  if (action === "remove") {
    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("request_id", requestId)
      .eq("voter_id", voterId);

    if (error) {
      return jsonResponse({ status: 400, body: { error: error.message } });
    }
    return jsonResponse({ body: { ok: true } });
  }

  return jsonResponse({ status: 400, body: { error: "Invalid action" } });
}
