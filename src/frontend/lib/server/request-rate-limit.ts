const WINDOW_MS = 60_000;
const MAX_ACTIONS_PER_WINDOW = 1;

function prune(ts: number[], now: number): number[] {
    return ts.filter((t) => now - t <= WINDOW_MS);
}

const store = new Map<string, number[]>();

export type RequestRateResult = 
    | { ok: true } 
    | { ok: false; retryAfterSec: number; message: string };

export function consumeRequestRateLimit(
    key:string,
    now = Date.now()
): RequestRateResult {
    const pruned = prune(store.get(key) ?? [], now);

    if(pruned.length >= MAX_ACTIONS_PER_WINDOW) {
        const oldest = Math.min(...pruned);
        const retryAfterSec = Math.max(
            1, Math.ceil((WINDOW_MS - (now - oldest))/1000)
        );

        return{
            ok: false,
            retryAfterSec,
            message: "Please wait before submitting another request."
        };
    }

    pruned.push(now);
    store.set(key, pruned);
    return {ok: true};
}