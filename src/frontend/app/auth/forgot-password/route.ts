import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request){
    const {origin} = new URL(req.url);
    const body = await req.json().catch(()=>null);
    const email = String(body?.email ?? "").trim().toLowerCase();
    
    if(!email){
        return NextResponse.json({error: "Email is required"},{status: 400});
    }

    const supabase = await createClient();
    const {error} = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/dj/update-password`,
    });

    if(error){
        return NextResponse.json({error: error.message}, {status: 400});
    }

    return NextResponse.json({ok: true});
}