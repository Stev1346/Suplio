import { DjDashboardResponse, getDjDashboard } from "@/lib/client/api/dj";
import { useCallback, useEffect, useState } from "react";
import { useSupabaseBrowser } from "../useSupabaseBrowser";

export function useDjDashboard(opts?: { realtime?: boolean }) {
    const supabase = useSupabaseBrowser();
    const enableRealtime = opts?.realtime ?? false;

    const [data, setData] = useState<DjDashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        const result = await getDjDashboard();
        setData(result.data);
        setError(result.error);
        setLoading(false);
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadInitial() {
            const result = await getDjDashboard();
            if (cancelled) return;

            setData(result.data);
            setError(result.error);
            setLoading(false);
        }

        void loadInitial();

        return () => {
            cancelled = true;
        };
    }, []);

    const djId = data?.djId;
    const eventIds = data?.eventIds ?? [];
    const eventIdsKey = eventIds.join(",");

    useEffect(() => {
        if (!enableRealtime || !djId) return;

        let timer: ReturnType<typeof setTimeout> | null = null;
        const scheduleRefetch = (ms = 120) => {
            if (timer) return;
            timer = setTimeout(() => {
                timer = null;
                void refetch();
            }, ms);
        };

        const channels: ReturnType<typeof supabase.channel>[] = [];

        const eventsChannel = supabase
            .channel("dj-dashboard-events")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "events",
                    filter: `dj_id=eq.${djId}`
                },
                () => scheduleRefetch()
            )
            .subscribe();
        channels.push(eventsChannel);

        const currentEventIds = eventIdsKey ? eventIdsKey.split(",") : [];
        for (const eventId of currentEventIds) {
            const channel = supabase
                .channel(`dj-dashboard-requests:${eventId}`)
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "requests",
                        filter: `event_id=eq.${eventId}`
                    },
                    () => scheduleRefetch()
                ).subscribe();

            channels.push(channel);
        }

        const reconcileId = setInterval(() => {
            void refetch();
        }, 15000);

        return () => {
            clearInterval(reconcileId);
            if (timer) clearTimeout(timer);
            channels.forEach((c) => supabase.removeChannel(c));
        };
    }, [enableRealtime, djId, eventIdsKey, refetch, supabase]);

    return { data, loading, error, refetch };
}