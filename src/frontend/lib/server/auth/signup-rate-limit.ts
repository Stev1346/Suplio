const WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS_PER_HOUR = 15;

function prune(ts: number[], now: number): number[] {
  return ts.filter((t) => now - t <= WINDOW_MS);
}

const store = new Map<string, number[]>();

export type SignupRateResult =
  | { ok: true }
  | { ok: false; status: number; retryAfterSec: number; message: string };

export function checkSignupAllowed(
  key: string,
  now = Date.now()
): SignupRateResult {
  const pruned = prune(store.get(key) ?? [], now);
  if (pruned.length >= MAX_ATTEMPTS_PER_HOUR) {
    const oldest = Math.min(...pruned);
    const retryAfterSec = Math.max(
      1,
      Math.ceil((WINDOW_MS - (now - oldest)) / 1000)
    );
    return {
      ok: false,
      status: 429,
      retryAfterSec,
      message: "Too many sign-up attempts from this network. Try again later.",
    };
  }
  return { ok: true };
}

export function recordSignupAttempt(key: string, now = Date.now()) {
  const pruned = prune(store.get(key) ?? [], now);
  pruned.push(now);
  store.set(key, pruned);
}
