"use client";

import HomeScreen from "@/screens/HomeScreen";
import SongRequestScreen from "@/screens/SongRequestScreen";
import VoteScreen from "@/screens/VoteScreen";
import { ComponentType } from "react";

export type RouteParams = {
    eventCode?: string;
};

export type RouteResult = {
    type: string;
    params: RouteParams;
    Component: ComponentType<RouteParams>;
};

export function getRouteComponent(slug: string[] | undefined): RouteResult | null {
    const path = slug ?? [];
    const segments = path.length === 0 ? [""] : path;

    // "/" or "/home" -> Home
    if(segments.length === 0 || segments[0]==="" || segments[0]==="home"){
        return{type: "home", params: {}, Component: HomeScreen};
    } 

    //"/event/[eventCode] or "/event/[eventCode]/vote"
    if(segments[0] === "event" && segments.length >=2){
        const eventCode = segments[1];
        if(segments[2] === "vote"){
            return{type: "event", params: {eventCode}, Component: VoteScreen};
        }

        return{type: "event", params: {eventCode}, Component: SongRequestScreen};
    }

    // "/dashboard/[eventCode]"

    return null;
}