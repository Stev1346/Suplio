import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AppSupabaseClient = SupabaseClient<Database>;
