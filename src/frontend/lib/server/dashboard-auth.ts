import { createHmac, randomInt, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SECRET = process.env.DASHBOARD_SESSION_SECRET ?? "";

function requireSecret() {
  if (!SECRET) throw new Error("Missing DASHBOARD_SESSION_SECRET");
}

export function generatePin(length = 6): string {
  let pin = "";
  for (let i = 0; i < length; i++) pin += randomInt(0, 10).toString();
  return pin;
}

export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPin(pin: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;

  const actual = scryptSync(pin, salt, 32);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

type SessionPayload = { eventCode: string; exp: number };

export function signSession(payload: SessionPayload): string {
  requireSecret();
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}