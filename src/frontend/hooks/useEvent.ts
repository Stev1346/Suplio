import { fetchEventByCode } from "@/lib/events";
import { useEffect, useState } from "react";

export type EventState = {
    id: string;
    name: string;
    allow_requests: boolean;
} | null;

export function useEvent(eventCode: string | undefined) {
    const [event, setEvent] = useState<EventState>(null);


    useEffect(() => {
        if (!eventCode) {
            return;
        }

        let cancelled = false;

        fetchEventByCode(eventCode).then(({ data, error }) => {
            if(!cancelled) {
                setEvent(error || !data ? null : data as EventState);
            }
        });
        return() => {cancelled = true};
    }, [eventCode]);

    const loading= !!eventCode && event === null

    return{event, setEvent, loading}
}