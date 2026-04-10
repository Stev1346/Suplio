import { useSupabaseBrowser } from "@/hooks/useSupabaseBrowser";
import { fetchEventByCode } from "@/lib/client/api/events";
import { useCallback, useEffect, useRef, useState } from "react";

export type EventState = {
  id: string;
  name: string;
  allow_requests: boolean;
} | null;

export function useEvent(
  eventCode: string | undefined,
  opts?: { realtime?: boolean }
) {
  const supabase = useSupabaseBrowser();
  const [event, setEvent] = useState<EventState>(null);
  const enableRealtime = opts?.realtime ?? false;
  const [error, setError] = useState<string | null>(null);
  const fetchSeq = useRef(0);

  const refetch = useCallback(async () => {
    if (!eventCode) return;
    const seq = ++fetchSeq.current;

    try {
      const { data, error } = await fetchEventByCode(supabase, eventCode);
      if (seq !== fetchSeq.current) return;

      setEvent(error || !data ? null : (data as EventState));
      setError(error ? error.message : null);
    } catch (e) {
      if (seq !== fetchSeq.current) return;
      setError(e instanceof Error ? e.message : "Failed to load event");
    }
  }, [eventCode, supabase]);

  useEffect(() => {
    if (!eventCode) {
      return;
    }

    let cancelled = false;
    const seq = ++fetchSeq.current;

    fetchEventByCode(supabase, eventCode)
      .then(({ data, error }) => {
        if (cancelled || seq !== fetchSeq.current) return;

        setEvent(error || !data ? null : (data as EventState));
        setError(error ? error.message : null);
      })
      .catch((e) => {
        if (cancelled || seq !== fetchSeq.current) return;
        setError(e instanceof Error ? e.message : "Failed to load event");
      });
    return () => {
      cancelled = true;
    };
  }, [eventCode, supabase]);

  useEffect(() => {
    if (!event?.id || !enableRealtime) return;

    const eventId = event.id;
    const channel = supabase.channel(`events:${eventId}`);
    const postgresChangesEvent = "postgres_changes" as unknown as Parameters<
      typeof channel.on
    >[0];

    channel
      .on(
        postgresChangesEvent,
        {
          event: "UPDATE",
          schema: "public",
          table: "events",
          filter: `id=eq.${eventId}`,
        },
        (payload: { new?: Partial<NonNullable<EventState>> }) => {
          if (!payload.new) return;
          setEvent((prev) => (prev ? { ...prev, ...payload.new } : prev));
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void refetch();
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          void refetch();
        }
      });

    const reconcileId = setInterval(() => {
      void refetch();
    }, 15000);
    return () => {
      clearInterval(reconcileId);
      supabase.removeChannel(channel);
    };
  }, [event?.id, enableRealtime, refetch, supabase]);

  const loading = !!eventCode && event === null;

  return { event, setEvent, loading, error, refetch };
}
