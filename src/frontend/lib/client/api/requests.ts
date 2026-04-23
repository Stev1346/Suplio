import type { AppSupabaseClient } from "@/lib/supabase/app-client";
import type { Database, RequestStatus } from "@/types/database";

export type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

export type FetchRequestsOptions = {
  statuses?: RequestStatus[];
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

export type InsertRequestResult = {
  error: string | null;
  retryAfterSec?: number;
}

export async function insertRequest(
  eventCode: string,
  params: {
    song_name: string;
    artist?: string | null;
    message?: string | null;
    performer_name?: string | null;
    request_type?: "song_request" | "karaoke";
  },
): Promise<InsertRequestResult> {
  const res = await fetch(
    `/api/guest/event/${encodeURIComponent(eventCode)}/requests`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    },
  );

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    retry_after_sec?: unknown;
  };

  if (!res.ok) {
    const fromBody =
      typeof data.retry_after_sec === "number" && Number.isFinite(data.retry_after_sec)
        ? Math.max(0, Math.ceil(data.retry_after_sec))
        : undefined;
    const fromHeader =
      res.status === 429
        ? Math.max(0, Math.ceil(Number(res.headers.get("Retry-After")) || 0))
        : undefined;
    const retryAfterSec =
      fromBody ?? (fromHeader && fromHeader > 0 ? fromHeader : undefined);
    return {
      error: data.error ?? "Could not submit request",
      ...(retryAfterSec != null && retryAfterSec > 0 ? { retryAfterSec } : {}),
    };
  }

  return { error: null };
}
