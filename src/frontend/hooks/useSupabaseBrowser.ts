import { createClient } from "@/lib/supabase/client";
import type { AppSupabaseClient } from "@/lib/supabase/app-client";
import { useMemo } from "react";

export function useSupabaseBrowser(): AppSupabaseClient {
  return useMemo(() => createClient(), []);
}
