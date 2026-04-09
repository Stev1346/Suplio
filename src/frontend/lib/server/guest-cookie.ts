import { createHmac, createHash, randomUUID } from "crypto";
import type { NextRequest } from "next/server";

export const GUEST_COOKIE_NAME = "gt_guest";

function sha256Hex(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function signGuestId(id: string, secret: string): string {
  return createHmac("sha256", secret).update(id, "utf8").digest("hex");
}

export function parseGuestCookie(
  raw: string | undefined,
  secret: string
): string | null {
  if (!raw) return null;
  const dot = raw.indexOf(".");
  if (dot <= 0) return null;
  const id = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (!id || !sig || id.length > 128) return null;
  if (signGuestId(id, secret) !== sig) return null;
  return id;
}

export function mintGuestCookieValue(secret: string): string {
  const id = randomUUID();
  return `${id}.${signGuestId(id, secret)}`;
}

/** Stable opaque id stored in `votes.voter_id` (same length as prior IP-hash scheme). */
export function voterIdFromGuestUuid(guestUuid: string): string {
  return sha256Hex(guestUuid);
}

export function requireGuestSessionSecret(): string {
  const secret = process.env.GUEST_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("GUEST_SESSION_SECRET must be set (min 16 chars)");
  }
  return secret;
}

/**
 * Returns voter hash for DB + optional new cookie value if the browser had no valid guest cookie.
 */
export function getOrMintGuestSession(req: NextRequest): {
  voterId: string;
  cookieToSet?: string;
} {
  const secret = requireGuestSessionSecret();
  const raw = req.cookies.get(GUEST_COOKIE_NAME)?.value;
  const id = parseGuestCookie(raw, secret);
  if (id) {
    return { voterId: voterIdFromGuestUuid(id) };
  }
  const cookieToSet = mintGuestCookieValue(secret);
  const newId = parseGuestCookie(cookieToSet, secret);
  if (!newId) {
    throw new Error("Failed to mint guest cookie");
  }
  return { voterId: voterIdFromGuestUuid(newId), cookieToSet };
}

export function guestCookieOptions(): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}
