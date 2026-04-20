import { logDjAction } from "@/lib/server/dj-audit";
import { requestStatus } from "@/lib/shared/constants/routes";
import { createClient } from "@/lib/supabase/server";
import type { SongRequestStatus } from "@/types/database";
import { NextResponse } from "next/server";

const STATUSES: SongRequestStatus[] = [
  requestStatus.lower.pending,
  requestStatus.lower.accepted,
  requestStatus.lower.rejected,
  requestStatus.lower.played,
];

type RouteContext = { params: Promise<{ requestId: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const { requestId } = await context.params;
  if (!requestId) {
    return NextResponse.json({ error: "Missing request" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const status = body?.status as string | undefined;
  if (!status || !STATUSES.includes(status as SongRequestStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data: row, error: rowError } = await supabase
    .from("requests")
    .select("id, event_id, events!inner(dj_id)")
    .eq("id", requestId)
    .single();

  if (rowError || !row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const nested = row as unknown as { events: { dj_id: string } };
  if (nested.events.dj_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("requests")
    .update({ status })
    .eq("id", requestId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const requestRow = row as unknown as { event_id: string; events: { dj_id: string } };
  await logDjAction({
    djId: user.id,
    action: "request.status.updated",
    eventId: requestRow.event_id,
    requestId,
    metadata: { status }
  });

  return NextResponse.json({ ok: true });
}
