import type { AppSupabaseClient } from "@/lib/supabase/app-client";
import { EventLifecycleStatus, EventMode } from "@/types/database";
import type { QrDesignPresetId } from "@/types/database";

/** Fields optional on create; carried by useCreateEvent → POST /api/dj/events */
export type CreateEventDesignFields = {
  event_code?: string;
  event_color?: string | null;
  qr_design?: QrDesignPresetId;
};

export type EventBasic = {
  id: string;
  name?: string;
  allow_requests?: boolean;
  lifecycle_status?: EventLifecycleStatus;
  event_mode?: EventMode;
  event_date?: string | null;
};

export async function fetchEventByCode(
  supabase: AppSupabaseClient,
  eventCode: string
) {
  const { data, error } = await supabase
    .from("events")
    .select("id, name, allow_requests, lifecycle_status, event_mode, event_date")
    .eq("event_code", eventCode)
    .maybeSingle();
  return { data: data as EventBasic | null, error };
}
