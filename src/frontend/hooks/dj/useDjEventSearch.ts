import { DjEventSearchItem, searchDjEvents } from "@/lib/client/api/dj";
import { useEffect, useRef, useState } from "react";

function isAbortError(e: unknown) {
    return (
        (typeof DOMException !== "undefined" 
            && e instanceof DOMException 
            && e.name === "AbortError" 
            || (e instanceof Error && e.name === "AbortError"))
    );
}

export function useDjEventSearch(delayMs = 250) {
    const [query, setQuery] = useState("");
    const [items, setItems] = useState<DjEventSearchItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const q = query.trim();
        if (q.length < 2) {
            abortRef.current?.abort();
            let cancelled = false;
            queueMicrotask(() => {
                if (cancelled) return;

                setItems([]);
                setError(null);
                setLoading(false);
            });
            return () => {
                cancelled = true;
            };
        }

        let cancelled = false;
        queueMicrotask(() => {
            if (cancelled) return;
            setLoading(true);
            setError(null);
        });

        const timer = setTimeout(async () => {
            abortRef.current?.abort();
            const ac = new AbortController();
            abortRef.current = ac;

            try{const { data, error } = await searchDjEvents(q, 8, ac.signal);
            if (ac.signal.aborted) return;

            setItems(data);
            setError(error);
            setLoading(false);}
            catch(e){
                if(isAbortError(e) || cancelled || ac.signal.aborted) return;
                setError("Search failed");
                setLoading(false);
            }
        }, delayMs);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
            abortRef.current?.abort();
        }
    }, [query, delayMs]);

    return { query, setQuery, items, loading, error };
}