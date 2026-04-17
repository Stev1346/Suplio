const SOCIAL_KEY_PREFIX = "link";

export function socialLinksToCommaText(links: Record<string, string> | null): string {
    if (!links) return "";
    return Object.values(links)
        .map((u) => u.trim())
        .filter(Boolean)
        .join(",");
}

export function commaTextToSocialLinks(raw: string): Record<string, string> | null {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return null;

    const out: Record<string, string> = {};
    let i = 0;
    for (const p of parts) {
        let u: URL
        try {
            u = new URL(p);
        }
        catch {
            throw new Error("Each social link must be a valid URL");
        }

        
        if (u.protocol !== "http:" && u.protocol !== "https:"){
            throw new Error("Social links must use http or https");
        }
        out[`${SOCIAL_KEY_PREFIX}_${++i}`] = u.toString();
    }
    return out;
}