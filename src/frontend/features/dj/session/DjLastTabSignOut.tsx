"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const CHANNEL = "suplio:dj-private-tabs";
const PING_MS = 4000;
const ROLL_CALL_WAIT_MS = 450;
const PRESENCE_STALE_MS = 12000;

type Msg =
  | { type: "ping"; tabId: string; ts: number }
  | { type: "leave"; tabId: string; ts: number }
  | { type: "roll-call"; nonce: string; fromTabId: string }
  | { type: "present"; nonce: string; tabId: string };

function postSignOut() {
  return fetch("/auth/sign-out", {
    method: "POST",
    credentials: "include",
  });
}

export function DjLastTabSignOut() {
  const tabIdRef = useRef(crypto.randomUUID());
  const bcRef = useRef<BroadcastChannel | null>(null);
  const peersRef = useRef<Map<string, number>>(new Map());
  const unloadViaPageHideRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    unloadViaPageHideRef.current = false;

    const tabId = tabIdRef.current;
    const bc = new BroadcastChannel(CHANNEL);
    bcRef.current = bc;

    const prune = () => {
      const now = Date.now();
      for (const [id, ts] of peersRef.current) {
        if (id !== tabId && now - ts > PRESENCE_STALE_MS) {
          peersRef.current.delete(id);
        }
      }
    };

    const onMessage = (ev: MessageEvent<Msg>) => {
      const m = ev.data;
      if (!m || typeof m !== "object") return;

      if (m.type === "ping") {
        peersRef.current.set(m.tabId, m.ts);
        prune();
        return;
      }
      if (m.type === "leave") {
        peersRef.current.delete(m.tabId);
        return;
      }
      if (m.type === "roll-call") {
        if (m.fromTabId !== tabId) {
          bc.postMessage({
            type: "present",
            nonce: m.nonce,
            tabId,
          } satisfies Msg);
        }
        return;
      }
      if (m.type === "present") {
        return;
      }
    };

    bc.addEventListener("message", onMessage);

    const broadcast = (msg: Msg) => bc.postMessage(msg);

    peersRef.current.set(tabId, Date.now());
    broadcast({ type: "ping", tabId, ts: Date.now() });

    const pingTimer = window.setInterval(() => {
      peersRef.current.set(tabId, Date.now());
      broadcast({ type: "ping", tabId, ts: Date.now() });
      prune();
    }, PING_MS);

    let tornDown = false;

    const runTeardown = () => {
      if (tornDown) return;
      tornDown = true;

      window.clearInterval(pingTimer);
      broadcast({ type: "leave", tabId, ts: Date.now() });

      const nonce = crypto.randomUUID();
      let sawOther = false;

      const onRoll = (ev: MessageEvent<Msg>) => {
        const m = ev.data;
        if (m?.type === "present" && m.nonce === nonce && m.tabId !== tabId) {
          sawOther = true;
        }
      };
      bc.addEventListener("message", onRoll);

      broadcast({ type: "roll-call", nonce, fromTabId: tabId });

      window.setTimeout(async () => {
        bc.removeEventListener("message", onRoll);
        bc.removeEventListener("message", onMessage);
        bc.close();
        bcRef.current = null;

        try {
          if (sawOther) return;
          if(!unloadViaPageHideRef.current) return;

          const beaconUrl = "/auth/sign-out";
          const beaconBody = new Blob([], { type: "application/json" });

          const beaconOk =
            unloadViaPageHideRef.current &&
            typeof navigator.sendBeacon === "function" &&
            navigator.sendBeacon(beaconUrl, beaconBody);
        if(beaconOk){
            return;
        }

          const res = await postSignOut();
          if (
            res.ok &&
            document.visibilityState === "visible" &&
            !window.location.pathname.startsWith("/dj/login")
          ) {
            router.refresh();
          }
        } catch {
          //ignore
        }
      }, ROLL_CALL_WAIT_MS);
    };

    const onPageHide = (e: PageTransitionEvent) => {
      if (e.persisted) return;
      unloadViaPageHideRef.current = true;
      runTeardown();
    };

    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      runTeardown();
    };
  }, [router]);

  return null;
}
