import { createGuestRouteContext } from "@/lib/server/guest-route-response";
import { createAdminSupabase } from "@/lib/server/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ eventCode: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const guest = createGuestRouteContext(req);
  if (!guest.ok) return guest.response;
  const { guestSession, json } = guest;

  const supabase = createAdminSupabase();

  const { eventCode } = await context.params;
  if (!eventCode) {
    return json({ error: "Missing event" }, { status: 400 });
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("event_code", eventCode)
    .single();

  if (eventError || !event) {
    return json({ error: "Event not found" }, { status: 404 });
  }

  const { data: requests } = await supabase
    .from("requests")
    .select("id")
    .eq("event_id", event.id);

  const requestIds = (requests ?? []).map((r) => r.id);
  if (requestIds.length === 0) {
    const res = json({ votes: [] }, { status: 200 });
    return res;
  }

  const { data: votes, error } = await supabase
    .from("votes")
    .select("id, request_id")
    .eq("voter_id", guestSession.voterId)
    .in("request_id", requestIds);

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return json({ votes: votes ?? [] }, { status: 200 });
}
