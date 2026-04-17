import { logDjAction } from "@/lib/server/dj-audit";
import { parseProfilePatch } from "@/lib/server/validators/dj-profile-validation";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
        .from("dj_profiles")
        .select("user_id, stage_name, bio, avatar_url, website, social_links, contact_info, created_at, updated_at")
        .eq("user_id", user.id)
        .single();

    if (error) {
        if(error.code === "PGRST116"){
            return NextResponse.json({error: "Profile not found"}, {status: 404});
        }
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ data }, { status: 200 });
}

export async function PATCH(req: Request) {
    const supabase = await createClient();
    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = parseProfilePatch(body);
    if (!parsed.ok) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { data: before, error: beforeError } = await supabase
        .from("dj_profiles")
        .select("stage_name, bio, avatar_url, website, social_links, contact_info")
        .eq("user_id", user.id)
        .single();

    if (beforeError || !before) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { error } = await supabase
        .from("dj_profiles")
        .update({ ...parsed.value, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logDjAction({
        djId: user.id,
        action: "profile.updated",
        metadata: {
            before, after: parsed.value
        }
    });

    return NextResponse.json({ ok: true }, { status: 200 })
}