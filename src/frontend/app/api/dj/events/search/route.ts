import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const q = String(url.searchParams.get("q") ?? "").trim();
    const limit = Math.min(20, Math.max(1, Number(url.searchParams.get("limit") ?? "8")));

    if(q.length < 2){
        return NextResponse.json({data: []}, {status: 200});
    }

    const code = q.toUpperCase();

    const {data, error} = await supabase
        .from("events")
        .select("id, name, event_code, created_at, lifecycle_status")
        .eq("dj_id", user.id)
        .neq("lifecycle_status", "archived")
        .or(`name.ilike.%${q}%,event_code.ilike.%${code}%`)
        .order("created_at",{ascending: false})
        .limit(limit);
    
        if(error){
            return NextResponse.json({error: error.message}, {status: 400});
        }

        return NextResponse.json({data: data ?? []}, {status: 200});
}