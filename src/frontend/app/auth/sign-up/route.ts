import { getClientIp } from "@/lib/server/client-ip";
import { consumeRateLimit } from "@/lib/server/consume-rate-limit";
import { stampDjSessionBound } from "@/lib/shared/utils/dj-session-bound";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { origin } = new URL(req.url);
    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const stageName = String(body?.stage_name ?? "").trim();

    if (!email || !password || !stageName) {
        return NextResponse.json(
            { error: "Email, password and stage name are required" },
            { status: 400 }
        );
    }

    const signupKey = `signup:${getClientIp(req)}`;
    const throttle = await consumeRateLimit(signupKey, 60 * 60, 15);

    if (throttle.rpcError) {
        return NextResponse.json(
            { error: "Rate-limit service unavailable. Please try again." },
            { status: 500 }
        )
    }

    if (!throttle.ok) {
        return NextResponse.json(
            { error: "Too many sign-up attempts from this network. Try again later." },
            {
                status: 429,
                headers: { "Retry-After": String(throttle.retryAfterSec ?? 60) },
            }
        );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
        email, password, options: {
            data: { stage_name: stageName },
            emailRedirectTo: `${origin}/auth/callback?next=/dj/dashboard`
        }
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const user = data.user;
    const session = data.session;

    if (!user) {
        return NextResponse.json(
            { error: "Sign up did not complete; please try again." },
            { status: 500 }
        );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRole) {
        return NextResponse.json(
            { error: "Server configuration error" },
            { status: 500 },
        );
    }
    const admin = createSupabaseAdmin(url, serviceRole);
    const { error: profileError } = await admin.from("dj_profiles").upsert(
        { user_id: user.id, stage_name: stageName },
        { onConflict: "user_id" },
    );

    if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    const res = NextResponse.json({
        ok: true,
        needsEmailConfirmation: !session,
      });
      if (session) stampDjSessionBound(res);
      return res;
}

