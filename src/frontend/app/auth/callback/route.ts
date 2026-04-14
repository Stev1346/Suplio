import { sanitizeInternalNextPath } from "@/lib/shared/utils/sanitize-internal-next-path";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const OTP_TYPES = new Set([
    "recovery",
    "signup",
    "email",
    "email_change",
    "invite",
    "magiclink",
]);

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const nextPath = sanitizeInternalNextPath(searchParams.get("next") );
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const code = searchParams.get("code");

    const supabase = await createClient();
    if (token_hash && type && OTP_TYPES.has(type)) {
        const { error } = await supabase.auth.verifyOtp({
            type: type as
                | "recovery"
                | "signup"
                | "email"
                | "email_change"
                | "invite"
                | "magiclink",
            token_hash,
        });

        if (error) {
            return NextResponse.redirect(`${origin}/dj/login?error=auth`);
        }

        return NextResponse.redirect(new URL(nextPath, origin));
    }

    if (!code) {
        return NextResponse.redirect(`${origin}/dj/login?error=auth`);
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
        return NextResponse.redirect(`${origin}/dj/login?error=auth`);
    }

    return NextResponse.redirect(new URL(nextPath, origin));

}