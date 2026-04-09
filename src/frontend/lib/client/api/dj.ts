import type { EventStatus } from "@/types/database";

export async function patchEventAllowRequests(
  eventId: string,
  allow: boolean
): Promise<{ error: string | null }> {
  const res = await fetch(
    `/api/dj/events/${encodeURIComponent(eventId)}/allow-requests`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allow_requests: allow }),
    }
  );
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { error: data.error ?? "Request failed" };
  }
  return { error: null };
}

export async function patchRequestStatus(
  requestId: string,
  status: EventStatus
): Promise<{ error: string | null }> {
  const res = await fetch(
    `/api/dj/requests/${encodeURIComponent(requestId)}/status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }
  );
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { error: data.error ?? "Request failed" };
  }
  return { error: null };
}
