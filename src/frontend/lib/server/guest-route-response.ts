import { NextRequest, NextResponse } from "next/server";
import { attachGuestCookie, getOrMintGuestSession } from "./guest-cookie";

type GuestSession = {voterId: string; cookieToSet?: string};
type GuestJson = (body: unknown, init?: ResponseInit) => NextResponse;

type GuestRouteContext =
    | {ok: false; response: NextResponse}
    | {ok: true; guestSession: GuestSession; json: GuestJson};

export function createGuestRouteContext(req: NextRequest): GuestRouteContext{
    let guestSession: GuestSession;

    try{
        guestSession = getOrMintGuestSession(req);
    }
    catch{
        return{
            ok:false,
            response: NextResponse.json(
                {error: "Server configuration error"},
                {status: 500}
            )
        };
    }

    const json: GuestJson = (body, init) => attachGuestCookie(NextResponse.json(body,init), guestSession);

    return {ok: true, guestSession, json};
}