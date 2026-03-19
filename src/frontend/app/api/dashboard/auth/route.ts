import { signSession, verifyPin } from "@/lib/server/dashboard-auth";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const COOKIE_NAME = "dj_session";

// Module scope (persists per server instance)
const attempts = new Map<string, { count: number; resetAt: number }>();
const SWEEP_INTERVAL_MS = 60_000;
let lastSweepAt = 0;

function sweepExpiredAttempts(now = Date.now()) {
  if (now - lastSweepAt < SWEEP_INTERVAL_MS) return;
  lastSweepAt = now;

  for (const [key, state] of attempts.entries()) {
    if (state.resetAt <= now) {
      attempts.delete(key);
    }
  }
}

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function getAttemptState(
  key: string,
  max = 8,
  windowMs = 5 * 60_000,
): { blocked: boolean; max: number; windowMs: number } {
  const now = Date.now();
  sweepExpiredAttempts(now);
  const curr = attempts.get(key);

  if (!curr || now > curr.resetAt) {
    attempts.delete(key);
    attempts.set(key, { count: 0, resetAt: now + windowMs });
    return { blocked: false, max, windowMs };
  }

  return { blocked: curr.count >= max, max, windowMs };
}

function registerFailedAttempt(key: string, windowMs = 5 * 60_000) {
  const now = Date.now();
  sweepExpiredAttempts(now);
  const curr = attempts.get(key);
  if (!curr || now > curr.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  curr.count += 1;
  attempts.set(key, curr);
}

function resetAttempts(key: string) {
  attempts.delete(key);
}

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const sessionSecret = process.env.DASHBOARD_SESSION_SECRET;

  if (!url || !serviceRole || !sessionSecret) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => null);
  const eventCode = String(body?.eventCode ?? "").trim();
  const pin = String(body?.pin ?? "").trim();
  if (!eventCode || !pin) {
    return NextResponse.json({ error: "Missing eventCode or pin" }, { status: 400 });
  }

  const ip = getClientIp(req);
  const rateKey = `${eventCode}:${ip}`;

  const state = getAttemptState(rateKey);
  if (state.blocked) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const supabase = createClient(url, serviceRole);
  const { data, error } = await supabase
    .from("events")
    .select("event_code,dj_pin_hash")
    .eq("event_code", eventCode)
    .single();

  if (error || !data || !verifyPin(pin, data.dj_pin_hash)) {
    registerFailedAttempt(rateKey, state.windowMs);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Successful login => clear failed attempts for this key
  resetAttempts(rateKey);

  let token: string;
  try {
    token = signSession({
      eventCode,
      exp: Date.now() + 1000 * 60 * 60 * 12,
    });
  } catch {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return res;
}