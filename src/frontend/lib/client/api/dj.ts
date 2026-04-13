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

export type DjEventListItem = {
  id: string;
  name: string;
  event_code: string;
  allow_requests: boolean;
  created_at: string;
}

export type DjEventsPageResponse = {
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
  items: DjEventListItem[];
}

export type DjDashboardResponse = {
  djId: string;
  metrics: {
    totalEvents: number;
    openEvents: number;
    totalRequests: number;
    pendingRequests: number;
    acceptedRequests: number;
    playedRequests: number;
  };
  recentEvents: DjEventListItem[];
  eventIds: string[];
}

export async function getDjDashboard(): Promise<{ data: DjDashboardResponse | null; error: string | null }> {
  const response = await fetch("/api/dj/dashboard", { credentials: "include" });

  const body = (await response.json().catch(() => ({}))) as {
    data?: DjDashboardResponse; error?: string
  };
  if (!response.ok || !body.data) {
    return { data: null, error: body.error ?? "Request failed" };
  }

  return { data: body.data, error: null };
}

export async function getDjEventsPage(
  page = 1,
  pageSize = 10
): Promise<{ data: DjEventsPageResponse | null; error: string | null }> {
  const response = await fetch(`/api/dj/events?page=${page}&pageSize=${pageSize}`, {
    credentials: "include"
  });

  const body = (await response.json().catch(() => ({}))) as {
    data?: DjEventsPageResponse; error?: string
  };
  if (!response.ok || !body.data) {
    return { data: null, error: body.error ?? "Request failed" };
  }
  return { data: body.data, error: null };
}