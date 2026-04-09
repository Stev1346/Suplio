const WINDOW_MS = 60_000;
const MAX_ACTIONS_PER_WINDOW = 50;

function prune(ts: number[], now: number): number[] {
  return ts.filter((t) => now - t <= WINDOW_MS);
}

const store = new Map<string, number[]>();

export type VoteRateResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number; message: string };

/** Atomically records this request if under the burst cap (call once per POST). */
export function consumeVoteRateLimit(
  key: string,
  now = Date.now()
): VoteRateResult {
  const pruned = prune(store.get(key) ?? [], now);
  if (pruned.length >= MAX_ACTIONS_PER_WINDOW) {
    const oldest = Math.min(...pruned);
    const retryAfterSec = Math.max(
      1,
      Math.ceil((WINDOW_MS - (now - oldest)) / 1000)
    );
    return {
      ok: false,
      retryAfterSec,
      message: "Too many vote actions. Please wait and try again.",
    };
  }
  pruned.push(now);
  store.set(key, pruned);
  return { ok: true };
}
