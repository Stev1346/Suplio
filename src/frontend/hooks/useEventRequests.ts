import { fetchRequestsForEvent, FetchRequestsOptions, RequestRow } from "@/lib/requests";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useEventRequests(eventId: string | undefined, options: FetchRequestsOptions = {}, opts?: { realtime?: boolean }) {
    const [requests, setRequests] = useState<RequestRow[]>([]);
    const enableRealtime = opts?.realtime ?? false;

    const refetch = useCallback(async () => {
        if (!eventId) {
            setRequests([]);
            return;
        }

        const data = await fetchRequestsForEvent(eventId, options);
        setRequests(data);
    }, [eventId, options]);

    useEffect(() => {
        if (!eventId) {
            return;
        }

        let cancelled = false;
        fetchRequestsForEvent(eventId, options).then((data) => {
            if (!cancelled) {
                setRequests(data);
            }
        })

        return () => {
            cancelled = true;
        }
    }, [eventId, options]);

    const loading = !!eventId && requests === null
    const effectiveRequests = !eventId || requests === null ? [] : requests;

    useEffect(() => {
        if (!eventId || !enableRealtime) return;

        const channel = supabase.channel(`requests:${eventId}`)
            .on("postgres_changes", {
                event: "*",
                schema: "public",
                table: "requests",
                filter: `event_id=eq.${eventId}`
            },
                () => {
                    refetch();
                }).subscribe();

        return () => { supabase.removeChannel(channel); }
    }, [eventId, enableRealtime, refetch]);


    return { requests: effectiveRequests, setRequests, loading, refetch }
}
