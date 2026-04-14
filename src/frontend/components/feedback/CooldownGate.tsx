import { CooldownState, useCooldownTimer } from "@/hooks/useCooldownTimer";
import { ReactNode } from "react";

type CooldownGateProps = {
    storageKey: string;
    children: (cooldown: CooldownState) => ReactNode;
};

export function CooldownGate({storageKey, children} : CooldownGateProps){
    const cooldown = useCooldownTimer(storageKey);
    return <>{children(cooldown)}</>
}