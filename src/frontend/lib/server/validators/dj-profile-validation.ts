import { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["dj_profiles"]["Row"];

export type ProfilePatchInput = {
    stage_name: string;
    bio?: string | null;
    website?: string | null;
    social_links?: Record<string, string> | null;
    contact_info?: Record<string, string> | null;
};

const MAX_STAGE = 80;
const MAX_BIO = 2000;
const MAX_URL = 2048;

function normalizeOptionalUrl(raw: string | null | undefined): string | null {
    if (raw == null) return null;

    const s = raw.trim();
    if (!s) return null;
    try {
        const u = new URL(s);
        if (u.protocol !== "http:" && u.protocol !== "https:") return "__invalid__";
        return u.toString();
    }
    catch {
        return "__invalid__";
    }
}

function sanitizeStringMap(
    v: unknown,
    maxKeys: number,
    maxValueLength: number
): Record<string, string> | null | "__invalid__" {
    if (v == null) return null;

    if (typeof v !== "object" || Array.isArray(v)) return "__invalid__";

    const out: Record<string, string> = {};
    const entries = Object.entries(v as Record<string, unknown>);
    if (entries.length > maxKeys) return "__invalid__";
    for (const [k, val] of entries) {
        if (typeof k !== "string" || k.length > 40) return "__invalid__";
        if (typeof val !== "string") return "__invalid__";

        const t = val.trim();
        if (!t) continue;
        if (t.length > maxValueLength) return "__invalid__";

        const urlish = normalizeOptionalUrl(t);
        if (urlish === "__invalid__") return "__invalid__";

        out[k] = urlish ?? t;
    }
    return Object.keys(out).length ? out : null;
}

function sanitizeContactInfo(v: unknown): { email?: string; phone?: string } | null | "__invalid__" {
    if (v == null) return null;
    if (typeof v !== "object" || Array.isArray(v)) return "__invalid__";

    const rec = v as Record<string, unknown>;
    const out: { email?: string; phone?: string } = {};

    if(rec.email !== undefined){
        if(typeof rec.email !== "string") return "__invalid__";
        const email = rec.email.trim().toLowerCase();
        if(email){
            const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if(!ok || email.length > 320) return"__invalid__";
            out.email = email;
        }
    }
    if(rec.phone !== undefined){
        if(typeof rec.phone !== "string") return "__invalid__";
        const phone = rec.phone.trim().toLowerCase();
        if(phone){
            const ok = /^[+\d()\-\s]{7,25}$/.test(phone);
            if(!ok || phone.length > 320) return"__invalid__";
            out.phone = phone;
        }
    }

    return Object.keys(out).length ? out : null;
}

export function parseProfilePatch(body: unknown):
    | { ok: true; value: Partial<ProfileRow> }
    | { ok: false; error: string } {
    if (!body || typeof body !== "object") {
        return { ok: false, error: "Invalid body" };
    }
    const b = body as ProfilePatchInput;
    const patch: Partial<ProfileRow> = {};

    if (b.stage_name !== undefined) {
        const s = b.stage_name.trim();
        if (!s) return { ok: false, error: "stage_name is required" };
        if (s.length > MAX_STAGE) return { ok: false, error: "stage_name too long" };
        patch.stage_name = s;
    }
    if (b.bio !== undefined) {
        const s = (b.bio ?? "").trim();
        patch.bio = s.length ? s.slice(0, MAX_BIO) : null;
    }
    if (b.website !== undefined) {
        const w = normalizeOptionalUrl(b.website ?? "");
        if (w === "__invalid__") return { ok: false, error: "Invalid website URL" };
        patch.website = w && w.length > MAX_URL ? null : w;
    }
    if (b.social_links !== undefined) {
        const m = sanitizeStringMap(b.social_links, 12, 300);
        if (m === "__invalid__") return { ok: false, error: "Invalid social_links" };
        patch.social_links = m;
    }
    if (b.contact_info !== undefined) {
        const c = sanitizeContactInfo(b.contact_info);
        if (c === "__invalid__") return { ok: false, error: "Invalid contact_info" };
        patch.contact_info = c;
    }
    if (Object.keys(patch).length === 0) {
        return { ok: false, error: "No changes provided" };
    }
    return { ok: true, value: patch };
}