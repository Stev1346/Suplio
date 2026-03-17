"use client";

import { usePathname } from "next/navigation";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type EventContextValue = {
  eventCode: string | undefined;
  setEventCode: (code: string | undefined) => void;
};

const EventContext = createContext<EventContextValue>({
  eventCode: undefined,
  setEventCode: () => {},
});

function getEventCodeFromPathname(pathname: string): string | undefined {
    const segments = pathname.split("/").filter(Boolean);
    const hasEventCode = (segments[0] === "event" || segments[0] === "dashboard") && segments[1];

    return hasEventCode ? segments[1] : undefined;
}

export function EventCodeProvider ({children}: {children: ReactNode}){
    const pathname = usePathname();
    const eventCodeFromUrl = getEventCodeFromPathname(pathname);
    const [overrideEventCode, setOverrideEventCode] = useState<string | undefined>(undefined);
    const eventCode = eventCodeFromUrl ?? overrideEventCode;


    const value = useMemo(
        ()=>({eventCode, setEventCode: setOverrideEventCode}), 
        [eventCode]
    )

    return(
        <EventContext.Provider value={value}>
            {children}
        </EventContext.Provider>
    )
}

export function useEventCode(): string | undefined {
    return useContext(EventContext).eventCode;
}

export function useSetEventCode(): (code: string | undefined)=>void {
    return useContext(EventContext).setEventCode;
}

