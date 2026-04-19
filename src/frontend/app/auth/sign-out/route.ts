import { clearDjSessionBound } from "@/lib/shared/utils/dj-session-bound";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    const res = NextResponse.json({ ok: true });
    clearDjSessionBound(res);
    return res;
}