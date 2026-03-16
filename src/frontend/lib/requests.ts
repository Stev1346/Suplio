import { Database, EventStatus } from "@/types/database";
import { supabase } from "./supabase";

export type RequestRow = Database["public"]["Tables"]["requests"]["Row"];

export type FetchRequestsOptions = {
    statuses?: EventStatus[];
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
};

export async function fetchRequestsForEvent(eventId: string, options: FetchRequestsOptions = {}): Promise<RequestRow[]> {
    const { statuses, orderBy = "song_name", ascending = true, limit } = options;
    let q = supabase.from("requests").select("*").eq("event_id", eventId);

    if (statuses?.length) q = q.in("status", statuses);
    
    q = q.order(orderBy, { ascending });
    
    if (limit != null) q = q.limit(limit);
    
    const { data } = await q;
    return data ?? [];
}

export async function updateRequestStatus(requestId:string, status: EventStatus) {
    const {error} = await supabase
        .from("requests")
        .update({status})
        .eq("id", requestId)
    return {error};
}

export async function insertRequest(params:{
    event_id: string;
    song_name: string;
    artist?: string | null;
    message?: string | null;
}) {
    const {error} = await supabase.from("requests").insert(params);
    return{error};
}