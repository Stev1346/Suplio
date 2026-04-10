import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ eventId: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const { eventId } = await context.params;
  if (!eventId) {
    return NextResponse.json({ error: "Missing event" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: event, error: evError } = await supabase
    .from("events")
    .select("id, dj_id")
    .eq("id", eventId)
    .single();

  if (evError || !event || event.dj_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const allow =
    typeof body?.allow_requests === "boolean" ? body.allow_requests : null;
  if (allow === null) {
    return NextResponse.json(
      { error: "allow_requests boolean required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("events")
    .update({ allow_requests: allow })
    .eq("id", event.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
