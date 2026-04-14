import type { AppSupabaseClient } from "@/lib/supabase/app-client";

export type EventBasic = {
  id: string;
  name?: string;
  allow_requests?: boolean;
};

export async function fetchEventByCode(
  supabase: AppSupabaseClient,
  eventCode: string
) {
  const { data, error } = await supabase
    .from("events")
    .select("id, name, allow_requests")
    .eq("event_code", eventCode)
    .maybeSingle();
  return { data: data as EventBasic | null, error };
}
