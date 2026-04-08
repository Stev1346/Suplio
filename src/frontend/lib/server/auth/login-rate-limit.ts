export type LoginThrottleResult =
    | { ok: true }
    | { ok: false; status: number; retryAfterSec: number; message: string; };

const SHORT_WINDOW_MS = 15 * 60 * 1000;
const LONG_WINDOW_MS = 60 * 60 * 1000;
const LOCKOUT_MS = 30 * 60 * 1000;
const BACKOFF_STEPS_MS = [30_000, 60_000, 120_000, 300_000, 600_000] as const;

type Entry = {
    failures: number[];
    lockoutUntil: number;
}

const store = new Map<string, Entry>();

function prune(ts: number[], windowMs: number, now: number) {
    return ts.filter((t) => now - t <= windowMs);
}

export function checkLoginAllowed(key: string, now = Date.now()): LoginThrottleResult {
    let e = store.get(key);
    if (!e) {
        e = { failures: [], lockoutUntil: 0 };
        store.set(key, e);
    }

    if (e.lockoutUntil > now) {
        const retryAfterSec = Math.ceil((e.lockoutUntil - now) / 1000);
        return {
            ok: false,
            status: 429,
            retryAfterSec,
            message: "Too many attempts. Try again later."
        }
    }

    const inLong = prune(e.failures, LONG_WINDOW_MS, now);
    if (inLong.length >= 10) {
        e.lockoutUntil = now + LOCKOUT_MS;
        e.failures = [];
        store.set(key, e);
        return {
            ok: false,
            status: 429,
            retryAfterSec: Math.ceil(LOCKOUT_MS / 1000),
            message: "Too many attempts. Try again in 30 minutes."
        }
    }

    const inShort = prune(e.failures, SHORT_WINDOW_MS, now);
    if (inShort.length >= 5) {
        const step = Math.min(inShort.length - 5, BACKOFF_STEPS_MS.length - 1)
        const lastFail = Math.max(...inShort)
        const earliest = lastFail + BACKOFF_STEPS_MS[step];
        if (now < earliest) {
            return {
                ok: false,
                status: 429,
                retryAfterSec: Math.ceil((earliest - now) / 1000),
                message: "Too many attempts. Please wait before trying again."
            }
        }
    }

    return {ok: true};
}

export function recordLoginFailure(key: string, now = Date.now()){
    const e = store.get(key) ?? {failures: [], lockoutUntil: 0};
    e.failures.push(now);
    e.failures = prune(e.failures, LONG_WINDOW_MS, now);
    store.set(key, e);
}

export function resetLoginAttempts(key: string){
    store.delete(key);
}