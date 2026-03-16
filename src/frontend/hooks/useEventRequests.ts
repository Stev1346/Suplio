import { fetchRequestsForEvent, FetchRequestsOptions, RequestRow } from "@/lib/requests";
import { useCallback, useEffect, useState } from "react";

export function useEventRequests(eventId: string | undefined, options: FetchRequestsOptions = {}) {
    const [requests, setRequests] = useState<RequestRow[]>([]);

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
            if(!cancelled){
                setRequests(data);
            }
        })

        return () => {
            cancelled = true;
        }
    }, [eventId, options]);

    const loading = !!eventId && requests === null
    const effectiveRequests = !eventId || requests === null ? [] : requests;

    return { requests: effectiveRequests, setRequests, loading, refetch }
}
