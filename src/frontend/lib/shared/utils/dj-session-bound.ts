import { NextResponse } from "next/server";

export const DJ_SESSION_STARTED_AT = "dj_session_started_at";

export function djMaxSessionMs(): number {
    const rawMs = process.env.DJ_MAX_SESSION_MS;
    if (rawMs && /^\d+$/.test(rawMs)) return Math.max(60_000, Number(rawMs));

    const rawHours = process.env.DJ_MAX_SESSION_HOURS ?? "24";
    const hours = Number(rawHours);
    
    if (!Number.isFinite(hours) || hours <= 0) return 8 * 60 * 60 * 1000;
    
    return hours * 60 * 60 * 1000;
}

function baseCookieOptions(){
    const secure = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        sameSite: "lax" as const,
        secure,
        path: "/",
        maxAge: 60*60*24*400
    };
}

export function stampDjSessionBound(response: NextResponse){
    response.cookies.set(DJ_SESSION_STARTED_AT, String(Date.now()), baseCookieOptions());
}

export function clearDjSessionBound(response: NextResponse){
    response.cookies.set(DJ_SESSION_STARTED_AT, "", {...baseCookieOptions(), maxAge: 0});
}

export function readDjSessionStartedAtMs(request: {cookies:{get: (n:string) => {value: string} | undefined}}){
    const raw = request.cookies.get(DJ_SESSION_STARTED_AT)?.value;
    if(!raw || !/^\d+$/.test(raw)) return null;
    return Number(raw);
}

export function isDjSessionBeyondMax(request: Request, nowMs = Date.now()){
    const started = readDjSessionStartedAtMs(request as unknown as {cookies: {get:(n:string) => {value: string} | undefined}});
    if(started == null) return true;
    return nowMs - started > djMaxSessionMs();
}