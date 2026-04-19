import type { AppSupabaseClient } from "@/lib/supabase/app-client";
import { EventLifecycleStatus } from "@/types/database";

export type EventBasic = {
  id: string;
  name?: string;
  allow_requests?: boolean;
  lifecycle_status?: EventLifecycleStatus;
};

export async function fetchEventByCode(
  supabase: AppSupabaseClient,
  eventCode: string
) {
  const { data, error } = await supabase
    .from("events")
    .select("id, name, allow_requests, lifecycle_status")
    .eq("event_code", eventCode)
    .maybeSingle();
  return { data: data as EventBasic | null, error };
}
