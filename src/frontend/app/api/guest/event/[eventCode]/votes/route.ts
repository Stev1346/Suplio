import { createGuestRouteContext } from "@/lib/server/guest-route-response";
import { createAdminSupabase } from "@/lib/server/supabase-admin";
import { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ eventCode: string }> };
type VoteAction = "add" | "remove";

function isVoteAction(value: unknown): value is VoteAction {
  return value === "add" || value === "remove";
}

export async function POST(req: NextRequest, context: RouteContext) {
  const guest = createGuestRouteContext(req);
  if (!guest.ok) return guest.response;

  const { guestSession, json } = guest;
  const supabase = createAdminSupabase();

  const { eventCode } = await context.params;
  if (!eventCode) {
    return json({ error: "Missing event" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const requestId = body?.request_id;
  const action = body?.action;

  if (typeof requestId !== "string" || !isVoteAction(action)) {
    return json(
      { error: "Missing request_id or action" },
      { status: 400 }
    );
  }

  const voterId = guestSession.voterId;

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("event_code", eventCode)
    .single();

  if (eventError || !event) {
    return json(
      { error: "Event not found" }, { status: 404 });
  }

  const { data: reqRow, error: reqError } = await supabase
    .from("requests")
    .select("id, event_id")
    .eq("id", requestId)
    .single();

  if (reqError || !reqRow || reqRow.event_id !== event.id) {
    return json(
      { error: "Invalid request" }, { status: 400 });
  }

  if (action === "add") {
    const { data, error } = await supabase
      .from("votes")
      .insert({ request_id: requestId, voter_id: voterId })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        const { data: row } = await supabase
          .from("votes")
          .select("id")
          .eq("request_id", requestId)
          .eq("voter_id", voterId)
          .maybeSingle();

        return json(
          {
            error: "Already voted",
            ...(row ? { data: { id: row.id } } : {}),
          },
          { status: 409 }
        );
      }
      return json({ error: error.message }, { status: 400 });
    }
    return json({ data: { id: data.id } }, { status: 200 });
  }

  if (action === "remove") {
    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("request_id", requestId)
      .eq("voter_id", voterId);

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }
    return json({ ok: true }, { status: 200 });
  }

  return json({ error: "Invalid action" }, { status: 400 });
}
