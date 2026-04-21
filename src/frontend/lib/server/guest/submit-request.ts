import { createAdminSupabase } from "../supabase-admin";

type SubmitGuestRequestInput = {
    eventCode: string;
    songName: string;
    artist?: string | null;
    message?: string | null;
    performerName?: string | null;
};

export async function submitGuestRequest(input: SubmitGuestRequestInput) {
    const supabase = createAdminSupabase();

    const { data: event, error: eventError } = await supabase
        .from("events")
        .select("id, allow_requests, lifecycle_status, event_mode")
        .eq("event_code", input.eventCode)
        .single();

    if (eventError || !event) {
        return { ok: false as const, status: 404, error: "Event not found" };
    }

    if (!event.allow_requests) {
        return { ok: false as const, status: 403, error: "Requests are currently paused" };
    }

    if (event.lifecycle_status !== "live") {
        return { ok: false as const, status: 403, error: "This event is not accepting requests right now" }
    }

    const requestType = event.event_mode === "karaoke" ? "karaoke" : "song_request";
    const song = input.songName.trim();
    const artist = input.artist?.trim() || null;
    const performer = input.performerName?.trim() || null;

    if (!song) {
        return { ok: false as const, status: 400, error: "Song name is required" };
    }

    if (requestType === "karaoke") {
        if (!performer) {
            return {
                ok: false as const,
                status: 400,
                error: "Performer name is required",
            };
        }
        if (!artist) {
            return {
                ok: false as const,
                status: 400,
                error: "Artist is required",
            };
        }
    }

    const { error: insertError } = await supabase.from("requests").insert({
        event_id: event.id,
        song_name: song,
        artist,
        message: input.message ?? null,
        request_type: requestType,
        performer_name: requestType === "karaoke" ? performer : null,
        removed_at: null
    });

    if (insertError) {
        return { ok: false as const, status: 400, error: insertError.message };
    }

    return { ok: true as const };
}