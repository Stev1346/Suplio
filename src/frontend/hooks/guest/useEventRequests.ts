import { fetchRequestsForEvent, FetchRequestsOptions, RequestRow } from "@/lib/client/api/requests";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { EventStatus } from "@/types/database";
import { compareRankedRequests } from "@/lib/request-ranking";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useEventRequests(eventId: string | undefined, options: FetchRequestsOptions = {}, opts?: { realtime?: boolean }) {
    const [requests, setRequests] = useState<RequestRow[] | null>(null);
    const enableRealtime = opts?.realtime ?? false;
    const [error, setError] = useState<string | null>(null);
    //start of stable primitives for realtime
    const statuses = options.statuses ?? undefined;
    const statusesKey = statuses ? statuses.join(",") : "";
    const orderBy = options.orderBy ?? "song_name";
    const ascending = options.ascending ?? true;
    const limit = options.limit;
    const isRequestRow = (v: unknown): v is RequestRow =>
        !!v &&
        typeof v === "object" &&
        "id" in v &&
        "event_id" in v &&
        "status" in v &&
        "votes" in v;
    //end of stable primitives for realtime
    const fetchSeq = useRef(0);
    const refetch = useCallback(async () => {
        if (!eventId) {
            setRequests(null);
            setError(null);
            return;
        }

        const seq = ++fetchSeq.current;

        try {
            const opts: FetchRequestsOptions = {
                statuses: statusesKey ? (statusesKey.split(",") as EventStatus[]) : undefined,
                orderBy,
                ascending,
                limit
            }

            const data = await fetchRequestsForEvent(eventId, opts);
            if (seq !== fetchSeq.current) return;

            setRequests(data);
            setError(null);
        } catch (e) {
            if (seq !== fetchSeq.current) return;
            setError(e instanceof Error ? e.message : "Failed to load requests")
        }
    }, [eventId, statusesKey, orderBy, ascending, limit]);

    useEffect(() => {
        if (!eventId) {
            return;
        }

        let cancelled = false;
        const seq = ++fetchSeq.current;

        const opts: FetchRequestsOptions = {
            statuses: statusesKey ? (statusesKey.split(",") as EventStatus[]) : undefined,
            orderBy,
            ascending,
            limit
        }

        fetchRequestsForEvent(eventId, opts).then((data) => {
            if (cancelled || seq !== fetchSeq.current) return;

            setRequests(data);
            setError(null);
        }).catch((e) => {
            if (cancelled || seq !== fetchSeq.current) return;
            setError(e instanceof Error ? e.message : "Failed to load requests")
        })

        return () => {
            cancelled = true;
        }
    }, [eventId, statusesKey, orderBy, ascending, limit]);

    const loading = !!eventId && requests === null
    const effectiveRequests = !eventId || requests === null ? [] : requests;

    //Realtime useEffect()
    useEffect(() => {
        if (!eventId || !enableRealtime) return;

        const statusList = statusesKey ? (statusesKey.split(",") as EventStatus[]) : undefined;
        const shouldInclude = (row: RequestRow) => row.event_id === eventId && (!statusList || statusList.includes(row.status));
        const sortAndLimit = (rows: RequestRow[]) => {
            let sorted: RequestRow[];

            if (orderBy === "votes") {
                sorted = [...rows].sort(
                    ascending
                        ? (a, b) => compareRankedRequests(b, a)
                        : compareRankedRequests
                )
            } else {
                sorted = [...rows].sort((a, b) => {
                    const av = a[orderBy as keyof RequestRow];
                    const bv = b[orderBy as keyof RequestRow];
                    if (av === bv) return 0;
                    if (av == null) return 1;
                    if (bv == null) return -1;

                    if (typeof av === "number" && typeof bv === "number") {
                        return ascending ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
                    }

                    const as = String(av);
                    const bs = String(bv);
                    return ascending ? as.localeCompare(bs) : bs.localeCompare(as);

                });
            }

            return limit != null ? sorted.slice(0, limit) : sorted;
        };

        const pending = new Map<string, { eventType: "INSERT" | "UPDATE" | "DELETE"; row?: RequestRow }>();

        let t: ReturnType<typeof setTimeout> | null = null;

        const flush = () => {
            t = null;
            const changes = Array.from(pending.values());
            pending.clear();

            if (changes.length === 0) return;

            setRequests((prev) => {
                const base = prev ?? [];

                // Apply each pending change once
                let next = base;
                for (const change of changes) {
                    const row = change.row;
                    if (change.eventType === "DELETE") {
                        // DELETE should provide the old row
                        if (!row) continue;
                        next = next.filter((r) => r.id !== row.id);
                        continue;
                    }
                    // INSERT / UPDATE both provide the final row we should consider
                    if (!row) continue;
                    if (!shouldInclude(row)) {
                        // Row no longer matches filters => remove it if present
                        next = next.filter((r) => r.id !== row.id);
                        continue;
                    }
                    // Row matches => replace it (remove existing, then insert)
                    next = next.filter((r) => r.id !== row.id);
                    next = [...next, row];
                }

                return sortAndLimit(next);
            });

        };

        const scheduleFlush = (flushMs = 60) => {
            if (t) return;

            t = setTimeout(flush, flushMs);
        };

        const channel = supabase.channel(`requests:${eventId}`)
        const postgresChangesEvent = "postgres_changes" as unknown as Parameters<typeof channel.on>[0];

        channel.on(postgresChangesEvent, {
            event: "*",
            schema: "public",
            table: "requests",
            filter: `event_id=eq.${eventId}`
        },
            (payload: RealtimePostgresChangesPayload<RequestRow>) => {
                const eventType = payload.eventType;
                const newRow = isRequestRow(payload.new) ? payload.new : undefined;
                const oldRow = isRequestRow(payload.old) ? payload.old : undefined;

                if (eventType === "DELETE") {
                    if (!oldRow) return;
                    pending.set(oldRow.id, { eventType, row: oldRow });
                    scheduleFlush();
                    return;
                }

                const row = newRow ?? oldRow;
                if (!row) return;


                pending.set(row.id, { eventType, row });
                scheduleFlush();
            }
        ).subscribe((status) => {
            if (status === "SUBSCRIBED") {
                void refetch();
                return;
            }

            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
                void refetch();
            }
        });

        const reconcileId = setInterval(() => {
            void refetch();
        }, 15000);

        return () => {
            //Clean up
            clearInterval(reconcileId)
            if (t) {
                clearTimeout(t);
                t = null;
                pending.clear();
            }
            supabase.removeChannel(channel);
        }
    }, [eventId, enableRealtime, ascending, limit, orderBy, statusesKey, refetch]);


    return { requests: effectiveRequests, setRequests, loading, refetch, error }
}
