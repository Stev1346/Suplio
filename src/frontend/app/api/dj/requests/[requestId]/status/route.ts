import { logDjAction } from "@/lib/server/dj-audit";
import { eventMode, KARAOKE_REQUEST_STATUSES, requestStatus } from "@/lib/shared/constants/routes";
import { createClient } from "@/lib/supabase/server";
import type { RequestType, SongRequestStatus } from "@/types/database";
import { NextResponse } from "next/server";

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
  if (!status) {
    return NextResponse.json({ error: "Missing status" }, { status: 400 });
  }

  const { data: row, error: rowError } = await supabase
    .from("requests")
    .select("id, event_id, request_type, events!inner(dj_id)")
    .eq("id", requestId)
    .single();

  if (rowError || !row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const typedRow = row as unknown as {
    id: string;
    event_id: string;
    request_type: RequestType;
    events: { dj_id: string };
  }
  if (typedRow.events.dj_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const songAllowed: SongRequestStatus[] = [
    requestStatus.lower.pending,
    requestStatus.lower.accepted,
    requestStatus.lower.rejected,
    requestStatus.lower.played,
  ]

  if (typedRow.request_type === eventMode.lower.songRequest) {
    if (!songAllowed.includes(status as SongRequestStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
  } else if (typedRow.request_type === eventMode.lower.karaoke) {
    if (!(KARAOKE_REQUEST_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
  }


  const { error } =
    typedRow.request_type === eventMode.lower.karaoke
      ? await supabase.rpc("set_karaoke_status_with_queue_rules", {
        p_request_id: requestId,
        p_new_status: status,
      })
      : await supabase.from("requests").update({ status }).eq("id", requestId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logDjAction({
    djId: user.id,
    action: "request.status.updated",
    eventId: typedRow.event_id,
    requestId,
    metadata: { status }
  });

  return NextResponse.json({ ok: true });
}
