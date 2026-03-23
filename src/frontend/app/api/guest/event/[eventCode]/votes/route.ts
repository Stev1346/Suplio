import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  const ip = xff ? xff.split(",")[0].trim() : req.headers.get("x-real-ip") ?? "";
  return ip || "unknown";
}

function sha256Hex(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
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

  const clientIp = getClientIp(req);
  const voterId = sha256Hex(clientIp);
  const supabase = createClient(url, serviceRoleKey);

  if (action === "add") {
    const { data: existing } = await supabase
      .from("votes")
      .select("id")
      .eq("request_id", requestId)
      .eq("voter_id", voterId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Already voted", data: { id: existing.id } },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("votes")
      .insert({ request_id: requestId, voter_id: voterId })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data: { id: data.id } }, { status: 200 });
  }

  if (action === "remove") {
    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("request_id", requestId)
      .eq("voter_id", voterId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}