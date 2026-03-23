type SessionPayload = { eventCode: string; exp: number };

const SECRET = process.env.DASHBOARD_SESSION_SECRET ?? "";

function base64UrlToBase64(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  return padded + "=".repeat(padLen);
}

function decodeBase64UrlUtf8(input: string): string {
  const base64 = base64UrlToBase64(input);
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifySessionEdge(token: string | undefined): Promise<SessionPayload | null> {
  if (!SECRET || !token) return null;

  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const expectedSig = encodeBase64Url(new Uint8Array(signature));

  if (!constantTimeEqual(sig, expectedSig)) return null;

  try {
    const payload = JSON.parse(decodeBase64UrlUtf8(body)) as SessionPayload;
    if (!payload?.eventCode || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}