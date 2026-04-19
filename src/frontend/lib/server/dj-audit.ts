import { createAdminSupabase } from "./supabase-admin";
import { captureServerError } from "./observability";

type  LogDjActionInput = {
    djId: string;
    action: string;
    eventId?: string | null;
    requestId?: string | null;
    metadata?: Record<string, unknown>;
};

export async function logDjAction(input: LogDjActionInput): Promise<void> {
    const supabase = createAdminSupabase();

    const {error} = await supabase.from("dj_audit_log").insert({
        dj_id: input.djId,
        action: input.action,
        event_id: input.eventId ?? null,
        request_id: input.requestId ?? null,
        metadata: input.metadata ?? {}
    });

    if(error){
        captureServerError(error, { message: "Failed to write dj audit log" });
    }
}