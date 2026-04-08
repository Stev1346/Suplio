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

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
        email, password, options: {
            data: { stage_name: stageName },
            emailRedirectTo: `${origin}/auth/callback?next=/dj/dashboard`
        }
    });

    if(error){
        return NextResponse.json({error: error.message}, {status: 400});
    }

    const user = data.user;
    const session = data.session;

    if(!user){
        return NextResponse.json(
            {error: "Sign up did not complete; please try again."},
            {status: 500}
        );
    }

    if(user && !session){
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if(!url || !serviceRole){
            return NextResponse.json({error: "Server configuration error"}, {status: 500});
        }
        const admin = createSupabaseAdmin(url,serviceRole);
        const {error: profileError} = await admin.from("dj_profiles").insert({
            user_id: user.id,
            stage_name: stageName
        });

        if(profileError){
            return NextResponse.json({error: profileError.message}, {status: 400})
        }
    }

    if (user && session) {
        const { error: profileError } = await supabase.from("dj_profiles").insert({
            user_id: user.id,
            stage_name: stageName,
        });
        
        if (profileError) {
            return NextResponse.json({ error: profileError.message }, { status: 400 });
        }
    }

    return NextResponse.json({
        ok:true,
        needsEmailConfirmation: !session,
    })
}