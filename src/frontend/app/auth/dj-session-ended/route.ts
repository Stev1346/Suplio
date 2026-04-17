import { clearDjSessionBound } from "@/lib/shared/utils/dj-session-bound";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request){
    const supabase = await createClient();
    await supabase.auth.signOut();

    const url = new URL("/dj/login", request.url);
    url.searchParams.set("error", "session_expired");

    const res = NextResponse.redirect(url);
    clearDjSessionBound(res);
    return res;
}