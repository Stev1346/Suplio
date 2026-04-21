import { useSupabaseBrowser } from "@/hooks/useSupabaseBrowser";
import { fetchEventByCode } from "@/lib/client/api/events";
import { EventLifecycleStatus, EventMode } from "@/types/database";
import { useCallback, useEffect, useRef, useState } from "react";

export type EventState = {
  id: string;
  name: string;
  allow_requests: boolean;
  lifecycle_status: EventLifecycleStatus;
  event_mode: EventMode;
  event_date: string | null;
} | null;

export function useEvent(
  eventCode: string | undefined,
  opts?: { realtime?: boolean }
) {
  const supabase = useSupabaseBrowser();
  const [event, setEvent] = useState<EventState>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(eventCode));
  const enableRealtime = opts?.realtime ?? false;
  const [error, setError] = useState<string | null>(null);
  const fetchSeq = useRef(0);

  const refetch = useCallback(async () => {
    if (!eventCode) {
      setEvent(null);
      setError(null);
      setLoading(false);
      return;
    }
    const seq = ++fetchSeq.current;

    try {
      const { data, error } = await fetchEventByCode(supabase, eventCode);
      if (seq !== fetchSeq.current) return;

      setEvent(error || !data ? null : (data as EventState));
      setError(error ? error.message : null);
    } catch (e) {
      if (seq !== fetchSeq.current) return;
      setEvent(null);
      setError(e instanceof Error ? e.message : "Failed to load event");
    } finally {
      if (seq === fetchSeq.current) {
        setLoading(false);
      }
    }
  }, [eventCode, supabase]);

  useEffect(() => {
    if (!eventCode) {
      setEvent(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const seq = ++fetchSeq.current;
    setLoading(true);

    fetchEventByCode(supabase, eventCode)
      .then(({ data, error }) => {
        if (cancelled || seq !== fetchSeq.current) return;

        setEvent(error || !data ? null : (data as EventState));
        setError(error ? error.message : null);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled || seq !== fetchSeq.current) return;
        setEvent(null);
        setError(e instanceof Error ? e.message : "Failed to load event");
        setLoading(false);
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

  return { event, setEvent, loading, error, refetch };
}
