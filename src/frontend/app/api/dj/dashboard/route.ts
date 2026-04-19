import { lifecycleStatus, requestStatus } from "@/lib/shared/constants/routes";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type DashboardMetrics = {
    activeEvents: number;
    requestsOpen: number;
    totalRequests: number;
    pendingRequests: number;
    acceptedRequests: number;
    playedRequests: number;
    rejectedRequests:number;
    draftEvents: number;
    liveEvents: number;
    endedEvents: number;
    archivedEvents: number;
}

export async function GET(){
    const supabase = await createClient();

    const {
        data: {user},
        error: authError
    } = await supabase.auth.getUser();

    if(authError || !user){
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const {data: events, error: eventsError} = await supabase
        .from("events")
        .select("id, allow_requests, created_at, name, event_code, lifecycle_status")
        .eq("dj_id", user.id)
        .order("created_at", {ascending: false});

    if(eventsError) {
        return NextResponse.json({error: eventsError.message}, {status: 400});
    }

    const eventIds = (events ?? []).map((e) => e.id);

    let totalRequests = 0;
    let pendingRequests = 0;
    let acceptedRequests = 0;
    let playedRequests = 0;
    let rejectedRequests = 0;

    if(eventIds.length > 0){
        const {data: requests, error: requestsError} = await supabase
            .from("requests")
            .select("status")
            .in("event_id", eventIds);
        if(requestsError){
            return NextResponse.json({error: requestsError.message}, {status: 400});
        }

        for(const request of requests ?? []){
            totalRequests += 1;
            if(request.status === requestStatus.lower.pending) pendingRequests += 1;
            if(request.status === requestStatus.lower.accepted) acceptedRequests += 1;
            if(request.status === requestStatus.lower.played) playedRequests += 1;
            if(request.status === requestStatus.lower.rejected) rejectedRequests += 1;
        }
    }

    let draftEvents = 0;
    let liveEvents = 0;
    let endedEvents = 0;
    let archivedEvents = 0;
    let requestsOpen = 0;
    for(const e of events ?? []){
        if(e.lifecycle_status === lifecycleStatus.lower.draft) draftEvents += 1;
        if(e.lifecycle_status === lifecycleStatus.lower.live) liveEvents += 1;
        if(e.lifecycle_status === lifecycleStatus.lower.ended) endedEvents += 1;
        if(e.lifecycle_status === lifecycleStatus.lower.archived) archivedEvents += 1;
        if(e.allow_requests) requestsOpen += 1;
    }

    const metrics: DashboardMetrics = {
        activeEvents: (events ?? []).length - archivedEvents,
        requestsOpen,
        totalRequests,
        pendingRequests,
        acceptedRequests,
        playedRequests,
        rejectedRequests,
        draftEvents,
        liveEvents,
        endedEvents,
        archivedEvents
    };

    return NextResponse.json({
        data:{
            djId: user.id,
            metrics,
            recentEvents: (events ?? []).slice(0,5),
            eventIds: eventIds
        }
    })
}