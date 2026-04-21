import { useSetEventCode } from "@/contexts/GuestEventContext";
import { EventMode } from "@/types/database";
import { useCallback, useState } from "react";

export type CreateEventPayload = {
  name: string;
  event_mode: EventMode;
  event_date: string | null;
}

export function useCreateEvent() {
  const setEventCode = useSetEventCode();
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (payload: CreateEventPayload) => {
    if (!payload.name.trim()) {
      setError("Event name is required");
      return null
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/dj/events", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: payload.name.trim(),
          event_mode: payload.event_mode,
          ...(payload.event_date !== null && payload.event_date !== ""
              ? {event_date: payload.event_date}
              : {}),
        }),
      });

      type CreateEventResponse = {
        data?: { event_code: string };
        error?: string;
      };

      const body = (await res.json().catch(() => ({}))) as CreateEventResponse;

      if (!res.ok || !body.data) {
        setError(body.error ?? "Could not create event");
        return null;
      }

      setCreatedCode(body.data.event_code);
      setEventCode(body.data.event_code);

      return body.data.event_code;
    } catch {
      setError("Could not create event");
      return null;
    }
    finally {
      setLoading(false);
    }
  }, [setEventCode]);

  return { submit, loading, createdCode, error, setError }
}