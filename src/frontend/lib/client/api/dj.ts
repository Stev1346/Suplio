import type { EventLifecycleStatus, EventMode, QrDesignPresetId, RequestStatus } from "@/types/database";

export type DjEventListItem = {
  id: string;
  name: string;
  event_code: string;
  allow_requests: boolean;
  created_at: string;
  lifecycle_status: EventLifecycleStatus;
  event_mode: EventMode;
  event_date: string | null;
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
    activeEvents: number;
    requestsOpen: number;
    totalRequests: number;
    pendingRequests: number;
    acceptedRequests: number;
    playedRequests: number;
    rejectedRequests: number;
    draftEvents: number;
    liveEvents: number;
    endedEvents: number;
    archivedEvents: number;
  };
  recentEvents: DjEventListItem[];
  eventIds: string[];
}

export type DjProfileResponse = {
  user_id: string;
  stage_name: string;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  social_links: Record<string, string> | null;
  contact_info: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export type PatchEventDetailsData = {
  id: string;
  name: string;
  event_code: string;
  allow_requests: boolean;
  lifecycle_status: EventLifecycleStatus;
  event_mode: EventMode;
  event_date: string | null;
  event_color: string | null;
  qr_design: QrDesignPresetId;
  event_code_edits_remaining: number;
};

export type DjEventSearchItem = {
  id: string;
  name: string;
  event_code: string;
  created_at: string;
  lifecycle_status: EventLifecycleStatus;
}

export type DjEventsLifecycleFilter =
  | "all"
  | "active"
  | "draft"
  | "live"
  | "ended"
  | "archived";

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
  status: RequestStatus
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

export async function patchEventDetails(
  eventId: string,
  input: {
    name?: string;
    lifecycle_status?: EventLifecycleStatus;
    event_mode?: EventMode;
    event_date?: string | null;
    event_code?: string;
    event_color?: string | null;
    qr_design?: QrDesignPresetId;
  },
): Promise<{ data: PatchEventDetailsData | null; error: string | null }> {
  const res = await fetch(`/api/dj/events/${encodeURIComponent(eventId)}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = (await res.json().catch(() => ({}))) as {
    data?: PatchEventDetailsData;
    error?: string;
  };

  if (!res.ok) {
    return { data: null, error: body.error ?? "Request failed" };
  }

  return { data: body.data ?? null, error: null };
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
  pageSize = 10,
  lifecycle: DjEventsLifecycleFilter = "active"
): Promise<{ data: DjEventsPageResponse | null; error: string | null }> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize)
  });
  if (lifecycle !== "active") {
    params.set("lifecycle", lifecycle);
  }

  const response = await fetch(`/api/dj/events?${params.toString()}`, {
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

export async function getDjProfile(): Promise<{
  data: DjProfileResponse | null;
  error: string | null;
}> {
  const response = await fetch("/api/dj/profile", { credentials: "include" });
  const body = (await response.json().catch(() => ({}))) as {
    data?: DjProfileResponse | null;
    error?: string;
  };
  if (!response.ok) {
    return { data: null, error: body.error ?? "Request failed" };
  }
  return { data: body.data ?? null, error: null };
}

export async function patchDjProfile(input: {
  stage_name?: string;
  bio?: string | null;
  website?: string | null;
  social_links?: Record<string, string> | null;
  contact_info?: Record<string, string> | null;
}): Promise<{ error: string | null }> {
  const res = await fetch("/api/dj/profile", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { error: data.error ?? "Request failed" };
  }
  return { error: null };
}

export async function uploadDjAvatar(file: File)
  : Promise<{ data: { avatar_url: string } | null; error: string | null }> {
  const fd = new FormData();
  fd.set("file", file);
  const res = await fetch("/api/dj/profile/avatar", {
    method: "POST",
    credentials: "include",
    body: fd
  });
  const body = (await res.json().catch(() => ({}))) as {
    data?: { avatar_url: string };
    error?: string;
  };
  if (!res.ok) {
    return { data: null, error: body.error ?? "Request failed" };
  }
  return { data: body.data ?? null, error: null };
}

export async function removeDjAvatar(): Promise<{ error: string | null }> {
  const res = await fetch("/api/dj/profile/avatar", {
    method: "DELETE",
    credentials: "include"
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { error: data.error ?? "Request failed" };
  }

  return { error: null };
}

export async function searchDjEvents(
  query: string,
  limit: 8,
  signal?: AbortSignal
): Promise<{ data: DjEventSearchItem[]; error: string | null }> {
  const q = query.trim();
  if (q.length < 2) return { data: [], error: null };

  const res = await fetch(
    `/api/dj/events/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    { credentials: "include", signal }
  );

  const body = (await res.json().catch(() => ({}))) as {
    data?: DjEventSearchItem[];
    error?: string;
  }

  if (!res.ok) {
    return { data: [], error: body.error ?? "Request failed" };
  }

  return { data: body.data ?? [], error: null };
}