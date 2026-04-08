import { DjPrivateNav } from "@/components/navigation/DjPrivateNav";
import React from "react";

export default function DjPrivateLayout({
    children,
}:{
    children: React.ReactNode;
}) {
    return (
        <>
        <DjPrivateNav/>
        {children}
        </>
    )
}