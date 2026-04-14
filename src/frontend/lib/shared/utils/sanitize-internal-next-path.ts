import { routes } from "../constants/routes";

const FALLBACK = routes.dj.dashboard;
const INTERNAL_BASE = "https://internal.invalid";

export function sanitizeInternalNextPath(raw: string | null): string {
  if (!raw) return FALLBACK;

  let value = raw.trim();
  if (!value) return FALLBACK;

  try {
    value = decodeURIComponent(value);
  } catch {
    return FALLBACK;
  }

  // Hard rejects for suspicious input
  if (
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("\0") ||
    value.toLowerCase().includes("javascript:")
  ) {
    return FALLBACK;
  }

  let parsed: URL;
  try {
    parsed = new URL(value, INTERNAL_BASE);
  } catch {
    return FALLBACK;
  }

  // Reject absolute external URLs
  if (parsed.origin !== INTERNAL_BASE) return FALLBACK;

  const path = parsed.pathname;

  // Keep redirects constrained to DJ app paths only
  if (!path.startsWith("/dj")) return FALLBACK;
  if (path.includes("/../") || path.endsWith("/..")) return FALLBACK;

  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}