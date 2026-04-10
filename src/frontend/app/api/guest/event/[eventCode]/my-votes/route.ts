import {
  GUEST_COOKIE_NAME,
  getOrMintGuestSession,
  guestCookieOptions,
} from "@/lib/server/guest-cookie";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ eventCode: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
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

  const { eventCode } = await context.params;
  if (!eventCode) {
    return NextResponse.json({ error: "Missing event" }, { status: 400 });
  }

  const supabase = createClient(url, serviceRoleKey);

  const { data: event, error: eventError } = await supabase
  .from("events")
  .select("id")
  .eq("event_code", eventCode)
  .single();
  
if (eventError || !event) {
  return NextResponse.json({ error: "Event not found" }, { status: 404 });
}

  const { data: requests } = await supabase
    .from("requests")
    .select("id")
    .eq("event_id", event.id);

  const requestIds = (requests ?? []).map((r) => r.id);
  if (requestIds.length === 0) {
    const res = NextResponse.json({ votes: [] }, { status: 200 });
    if (guestSession.cookieToSet) {
      res.cookies.set(
        GUEST_COOKIE_NAME,
        guestSession.cookieToSet,
        guestCookieOptions()
      );
    }
    return res;
  }

  const { data: votes, error } = await supabase
    .from("votes")
    .select("id, request_id")
    .eq("voter_id", guestSession.voterId)
    .in("request_id", requestIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const res = NextResponse.json({ votes: votes ?? [] }, { status: 200 });
  if (guestSession.cookieToSet) {
    res.cookies.set(
      GUEST_COOKIE_NAME,
      guestSession.cookieToSet,
      guestCookieOptions()
    );
  }
  return res;
}
