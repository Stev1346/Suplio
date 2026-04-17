import { DjProfilePublicFields } from "@/features/dj/profile/DjProfilePublicView";

export async function fetchGuestDjProfile(eventCode: string): Promise<{ data: DjProfilePublicFields | null; error: string | null }> {
    const res = await fetch(
        `/api/guest/event/${encodeURIComponent(eventCode)}/dj-profile`,
        { method: "GET", credentials: "include" }
    );

    if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        return {
            data: null,
            error: err.error ?? `Request failed (${res.status})`
        };
    }

    const data = (await res.json()) as DjProfilePublicFields;
    return { data, error: null };
}