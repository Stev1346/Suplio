// src/frontend/app/api/my-votes/route.ts
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

export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const eventId = req.nextUrl.searchParams.get("event_id");
  if (!eventId) {
    return NextResponse.json({ error: "Missing event_id" }, { status: 400 });
  }

  const voterId = sha256Hex(getClientIp(req));
  const supabase = createClient(url, serviceRoleKey);

  // Get request IDs for this event
  const { data: requests } = await supabase
    .from("requests")
    .select("id")
    .eq("event_id", eventId);
  const requestIds = (requests ?? []).map((r) => r.id);
  if (requestIds.length === 0) {
    return NextResponse.json({ votes: [] }, { status: 200 });
  }

  const { data: votes, error } = await supabase
    .from("votes")
    .select("id, request_id")
    .eq("voter_id", voterId)
    .in("request_id", requestIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ votes: votes ?? [] }, { status: 200 });
}