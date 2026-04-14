import { DjEventsPageResponse, getDjEventsPage } from "@/lib/client/api/dj";
import { useCallback, useEffect, useState } from "react";
import { useSupabaseBrowser } from "../useSupabaseBrowser";

export function useDjEventsPage(initialPage = 1, pageSize = 10, opts?: { realtime?: boolean }) {
    const supabase = useSupabaseBrowser();
    const enableRealtime = opts?.realtime ?? false;

    const [page, setPage] = useState(initialPage);
    const [data, setData] = useState<DjEventsPageResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        const result = await getDjEventsPage(page, pageSize);
        setData(result.data);
        setError(result.error);
        setLoading(false);
    }, [page, pageSize]);

    useEffect(() => {
        let cancelled = false;

        async function loadPage() {
            const result = await getDjEventsPage(page, pageSize);
            if (cancelled) return;

            setData(result.data);
            setError(result.error);
            setLoading(false);
        }

        void loadPage();

        return () => {
            cancelled = true;
        };
    }, [page, pageSize]);

    useEffect(() => {
        if (!enableRealtime) return;

        let isMounted = true;
        let timer: ReturnType<typeof setTimeout> | null = null;
        let reconcileId: ReturnType<typeof setInterval> | null = null;
        let eventsChannel: ReturnType<typeof supabase.channel> | null = null;

        const scheduleRefetch = (ms = 120) => {
            if (timer) return;
            timer = setTimeout(() => {
                timer = null;
                void refetch();
            }, ms);
        };

        async function setupRealtime() {
            const { data: { user } } = await supabase.auth.getUser();

            if (!isMounted || !user) return;

            eventsChannel = supabase
                .channel(`dj-events:${user.id}`)
                .on("postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "events",
                        filter: `dj_id=eq.${user.id}`
                    },
                    () => { scheduleRefetch(); }
                )
                .subscribe((status) => {
                    if (status === "SUBSCRIBED") {
                        void refetch();
                    }
                    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
                        void refetch();
                    }
                });

            reconcileId = setInterval(() => {
                void refetch();
            }, 15000);
        }

        void setupRealtime();

        return () => {
            isMounted = false;

            if (timer) {
                clearTimeout(timer);
                timer = null;
            }

            if (reconcileId) {
                clearInterval(reconcileId);
                reconcileId = null;
            }

            if (eventsChannel) {
                supabase.removeChannel(eventsChannel);
                eventsChannel = null;
            }
        };

    }, [enableRealtime, refetch, supabase]);

    return { page, setPage, data, loading, error, refetch };
}