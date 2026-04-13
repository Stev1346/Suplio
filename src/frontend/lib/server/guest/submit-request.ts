import { createAdminSupabase } from "../supabase-admin";

type SubmitGuestRequestInput = {
    eventCode: string;
    songName: string;
    artist?: string | null;
    message?: string | null;
};

export async function submitGuestRequest(input: SubmitGuestRequestInput) {
    const supabase = createAdminSupabase();

    const { data: event, error: eventError } = await supabase
        .from("events")
        .select("id, allow_requests")
        .eq("event_code", input.eventCode)
        .single();

    if (eventError || !event) {
        return { ok: false as const, status: 404, error: "Event not found" };
    }

    if (!event.allow_requests) {
        return { ok: false as const, status: 403, error: "Requests are currently paused" };
    }

    const { error: insertError } = await supabase.from("requests").insert({
        event_id: event.id,
        song_name: input.songName,
        artist: input.artist ?? null,
        message: input.message ?? null
    });

    if (insertError) {
        return { ok: false as const, status: 400, error: insertError.message };
    }

    return { ok: true as const };
}