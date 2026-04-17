import { DjProfilePublicFields } from "@/features/dj/profile/DjProfilePublicView";
import { DjProfileResponse } from "@/lib/client/api/dj";
import { createGuestRouteContext } from "@/lib/server/guest-route-response";
import { createAdminSupabase } from "@/lib/server/supabase-admin";
import { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ eventCode: string }> };

function asStringRecord(value: unknown): Record<string, string> | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;

    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(value)) {
        if (typeof v === "string" && v.trim()) out[k] = v;
    }

    return Object.keys(out).length ? out : null;
}

export async function GET(_req: NextRequest, context: RouteContext) {
    const guest = createGuestRouteContext(_req);
    if (!guest.ok) return guest.response;

    const { json } = guest;
    const { eventCode } = await context.params;

    if (!eventCode?.trim()) {
        return json({ error: "Missing event" }, { status: 400 });
    }

    const supabase = createAdminSupabase();
    const { data: event, error: eventError } = await supabase
        .from("events")
        .select("dj_id")
        .eq("event_code", eventCode.trim())
        .maybeSingle();

    if (eventError || !event) {
        return json({ error: "Event not found" }, { status: 404 });
    }

    const { data: profile, error: profileError } = await supabase
        .from("dj_profiles")
        .select("stage_name, bio, avatar_url,website,social_links,contact_info")
        .eq("user_id", event.dj_id)
        .maybeSingle();

    if (profileError || !profile) {
        return json({ error: "DJ profile not found" }, { status: 404 });
    }

    const body: DjProfilePublicFields = {
        stage_name: profile.stage_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        website: profile.website,
        social_links: asStringRecord(profile.social_links),
        contact_info: asStringRecord(profile.contact_info),
    };

    return json(body);
}