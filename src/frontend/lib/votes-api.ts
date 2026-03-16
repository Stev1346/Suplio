export type MyVote = { request_id: string; id: string };

export async function fetchMyVotes(eventId: string): Promise<MyVote[]> {
    try {
        const res = await fetch(`/api/my-votes?event_id=${encodeURIComponent(eventId)}`);
        if (!res.ok) return [];

        const data = (await res.json()) as {votes?: unknown};
        const votes  = data.votes;
        return Array.isArray(votes)
            ? votes.filter((v): v is MyVote => {
                const o = v as Record<string, unknown>;
                return typeof o?.request_id === "string" && typeof o?.id === "string";
            })
            : [];
    } catch {
        return []
    }
}

export async function castVote(
    requestId: string,
    action: "add" | "remove"): Promise<{ ok: boolean; status: number; data?: { id?: string }; error?: string }> {
    const res = await fetch("/api/cast-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId, action })
    });

    const data = await res.json().catch(()=> ({}));
    return {
        ok: res.ok,
        status: res.status,
        data: data?.data,
        error: data?.error
    }
}