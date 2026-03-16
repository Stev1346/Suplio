import { generateEventCode } from "./event-code";
import { supabase } from "./supabase";

export type EventBasic = {
    id: string;
    name?: string;
    allow_requests?: boolean;
}

export async function fetchEventByCode(eventCode: string) {
    const { data, error } = await supabase
        .from("events")
        .select("id, name, allow_requests")
        .eq("event_code", eventCode)
        .single();
    return { data: data as EventBasic | null, error }
}

export async function updateEventAllowRequests(eventId: string, allow: boolean) {
    const { error } = await supabase
        .from("events")
        .update({ allow_requests: allow })
        .eq("id", eventId);
    return { error };
}

export async function createEvent(name: string): Promise<{
    data: { event_code: string } | null;
    error: string | null;
}> {
    let code = generateEventCode(8)
    const maxAttempts = 10;
    for (let i = 0; i < maxAttempts; i++) {
        const { data, error } = await supabase
            .from("events")
            .insert({ name: name.trim(), event_code: code })
            .select("event_code")
            .single();

        if (!error) return { data, error: null }
        if (error.code === "23505") {
            code = generateEventCode(8);
            continue;
        }

        return { data: null, error: error.message }
    }
    return { data: null, error: "Could not generate unique code. Try again." }
}