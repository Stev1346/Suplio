import type { AppSupabaseClient } from "@/lib/supabase/app-client";
import type { Database, EventStatus } from "@/types/database";

export type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

export type FetchRequestsOptions = {
  statuses?: EventStatus[];
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
};

export async function fetchRequestsForEvent(
  supabase: AppSupabaseClient,
  eventId: string,
  options: FetchRequestsOptions = {}
): Promise<RequestRow[]> {
  const { statuses, orderBy = "song_name", ascending = true, limit } = options;
  let q = supabase.from("requests").select("*").eq("event_id", eventId);

  if (statuses?.length) q = q.in("status", statuses);

  q = q.order(orderBy, { ascending });

  if (limit != null) q = q.limit(limit);

  const { data } = await q;
  return data ?? [];
}

export async function insertRequest(
  eventCode: string,
  params: {
    song_name: string;
    artist?: string | null;
    message?: string | null;
  },
): Promise<{ error: string | null }> {
  const res = await fetch(
    `/api/guest/event/${encodeURIComponent(eventCode)}/requests`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    },
  );

  const data = (await res.json().catch(() => ({}))) as { error?: string };

  if (!res.ok) {
    return { error: data.error ?? "Could not submit request" };
  }

  return { error: null };
}
