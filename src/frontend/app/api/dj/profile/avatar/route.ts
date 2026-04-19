import { consumeRateLimit } from "@/lib/server/consume-rate-limit";
import { logDjAction } from "@/lib/server/dj-audit";
import { captureServerError } from "@/lib/server/observability";
import { createAdminSupabase } from "@/lib/server/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedMime = (typeof ALLOWED_TYPES)[number];

const typeToExt: Record<AllowedMime, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

function normalizeMime(t: string): AllowedMime | null {
    return (ALLOWED_TYPES as readonly string[]).includes(t) ? (t as AllowedMime) : null;
}

const MAX_BYTES = 2 * 1024 * 1024;

const PUBLIC_MARKERS = [
    "/storage/v1/object/public/dj-avatars",
    "/object/public/dj-avatars",
] as const;

function pathFromPublicDjAvatarUrl(url: string | null): string | null {
    if (!url) return null;
    for (const marker of PUBLIC_MARKERS) {
        const i = url.indexOf(marker);

        if (i !== -1) {
            return decodeURIComponent(url.slice(i + marker.length));
        }
    }
    return null;
}

export async function POST(req: Request) {
    const supabase = await createClient();
    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) {
        return NextResponse.json({ error: "file required" }, { status: 400 });
    }
    const mime = normalizeMime(file.type);
    if (!mime) {
        return NextResponse.json({ error: "Unsupported image type" }, { status: 415 });
    }
    if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    const rateLimit = await consumeRateLimit(`dj:avatar:${user.id}`, 60, 10);
    if (!rateLimit.ok) {
        return NextResponse.json(
            { error: "Too many uploads, try again later." },
            { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSec ?? 60) } }
        );
    }

    const contentType = mime;
    const ext = typeToExt[mime];
    const objectPath = `${user.id}/${randomUUID()}.${ext}`;

    const admin = createAdminSupabase();
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) {
        return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    const { error: upError } = await admin.storage
        .from("dj-avatars")
        .upload(objectPath, buf, { contentType, upsert: true });
    if (upError) {
        return NextResponse.json({ error: upError.message }, { status: 400 });
    }

    const { data: pub } = admin.storage.from("dj-avatars").getPublicUrl(objectPath);
    const publicUrl = pub.publicUrl;

    const { data: prev, error: prevError } = await supabase
        .from("dj_profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

    if (prevError) {
        await admin.storage.from("dj-avatars").remove([objectPath]);
        return NextResponse.json({ error: prevError.message }, { status: 400 });
    }

    const { data: updatedRows, error: dbError } = await supabase
        .from("dj_profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .select("user_id");

    if (dbError) {
        await admin.storage.from("dj-avatars").remove([objectPath]);
        return NextResponse.json({ error: dbError.message }, { status: 400 });
    }
    if (!updatedRows?.length) {
        await admin.storage.from("dj-avatars").remove([objectPath]);
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }


    const oldPath = pathFromPublicDjAvatarUrl(prev?.avatar_url ?? null);
    if (oldPath && oldPath !== objectPath) {
        await admin.storage.from("dj-avatars").remove([oldPath]);
    }


    try {
        await logDjAction({
            djId: user.id,
            action: "profile.avatar.updated",
            metadata: {
                prev_avatar_url: prev?.avatar_url ?? null,
                next_avatar_url: publicUrl,
                storage_path: objectPath
            }
        });
    } catch (e) {
        captureServerError(e, { message: "profile.avatar.updated audit failed", userId: user.id });
    }

    return NextResponse.json({ data: { avatar_url: publicUrl } }, { status: 200 })
}

export async function DELETE() {
    const supabase = await createClient();
    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminSupabase();

    const { data: prev, error: prevError } = await supabase
        .from("dj_profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

    if (prevError) {
        return NextResponse.json({ error: prevError.message }, { status: 400 });
    }
    if (prev === null) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const oldPath = pathFromPublicDjAvatarUrl(prev?.avatar_url ?? null);
    if (oldPath) {
        const { error: storageError } = await admin.storage
            .from("dj-avatars")
            .remove([oldPath]);
            
        if (storageError) {
            captureServerError(storageError, {
                message: "avatar storage remove failed",
                userId: user.id,
                oldPath,
            });
            return NextResponse.json(
                { error: "Could not remove avatar file; profile unchanged." },
                { status: 502 },
            );
        }
    }

    const { error: dbError } = await supabase
        .from("dj_profiles")
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
    if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    try {
        await logDjAction({
            djId: user.id,
            action: "profile.avatar.removed",
            metadata: {
                prev_avatar_url: prev?.avatar_url ?? null
            }
        });
    }
    catch (e) {
        captureServerError(e, { message: "profile.avatar.removed audit failed", userId: user.id });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
}