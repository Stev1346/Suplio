import { useEffect, useMemo, useState } from "react";

export type CooldownState = {
    isCoolingDown: boolean;
    secondsLeft: number;
    startCooldown: (seconds: number) => void;
    clearCooldown: () => void;
  };

export function useCooldownTimer(storageKey: string): CooldownState {
    const [cooldownUntilMs, setCooldownUntilMs] = useState<number | null>(() => {
        if (typeof window === "undefined") return null;
        
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) return null;

        const parsed = Number(raw);
        if (!Number.isFinite(parsed) || parsed <= Date.now()) {
            window.localStorage.removeItem(storageKey);
            return null;
        }

        return parsed;
    });
    
    const [nowMs, setNowMs] = useState(() => Date.now());

    useEffect(() => {
        if (cooldownUntilMs == null) return;

        const id = window.setInterval(() => {
            const now = Date.now()
            setNowMs(now);

            if (cooldownUntilMs <= now) {
                setCooldownUntilMs(null);
                window.localStorage.removeItem(storageKey);
            }
        }, 1000);

        return () => window.clearInterval(id);
    }, [cooldownUntilMs, storageKey]);

    const secondsLeft = useMemo(() => {
        if (cooldownUntilMs == null) return 0;
        return Math.max(0, Math.ceil((cooldownUntilMs - nowMs) / 1000));
    }, [cooldownUntilMs, nowMs]);

    const isCoolingDown = secondsLeft > 0;

    const startCooldown = (seconds: number) => {
        const safe = Math.max(1, Math.ceil(seconds));
        const until = Date.now() + safe * 1000;
        setNowMs(Date.now());
        setCooldownUntilMs(until);
        window.localStorage.setItem(storageKey, String(until));
    };

    const clearCooldown = () => {
        setCooldownUntilMs(null);
        window.localStorage.removeItem(storageKey);
    }

    return {
        isCoolingDown,
        secondsLeft,
        startCooldown,
        clearCooldown
    }
}