import { createAdminSupabase } from "./supabase-admin";

export async function consumeRateLimit(
    key: string,
    windowSeconds: number,
    maxHits: number
): Promise<{ ok: boolean; retryAfterSec?: number; rpcError?: string }> {
    const admin = createAdminSupabase();
    const { data, error } = await admin.rpc("consume_rate_limit", {
        p_key: key,
        p_window_seconds: windowSeconds,
        p_max_hits: maxHits,
    });

    if (error) return { ok: false, rpcError: error.message };

    const row = data?.[0];
    if (!row?.ok) {
        return { ok: false, retryAfterSec: row?.retry_after_sec ?? 60 };
    }

    return { ok: true };
}