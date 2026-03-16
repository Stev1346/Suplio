"use client";

import HomeScreen from "@/screens/HomeScreen";
import ScanScreen from "@/screens/ScanScreen";
import SongRequestScreen from "@/screens/SongRequestScreen";
import VoteScreen from "@/screens/VoteScreen";
import DashboardScreen from "@/screens/DashboardScreen";
import { ComponentType } from "react";

export type RouteParams = {
  eventCode?: string;
};

export type RouteResult = {
  type: string;
  params: RouteParams;
  Component: ComponentType<RouteParams>;
};

export function getRouteComponent(
  slug: string[] | undefined,
): RouteResult | null {
  const path = slug ?? [];
  const segments = path.length === 0 ? [""] : path;

  // "/" or "/home" -> Home
  if (segments.length === 0 || segments[0] === "" || segments[0] === "home") {
    return { type: "home", params: {}, Component: HomeScreen };
  }

  //"/event/[eventCode] or "/event/[eventCode]/request" or "/event/[eventCode]/vote"
  if (segments[0] === "event" && segments.length >= 2) {
    const eventCode = segments[1];

    if (segments[2] === "request") {
      return {
        type: "event",
        params: { eventCode },
        Component: SongRequestScreen,
      };
    }
    if (segments[2] === "vote") {
      return { type: "event", params: { eventCode }, Component: VoteScreen };
    }
    if (segments[2] === "scan" || segments[2] === undefined) {
      return { type: "event", params: { eventCode }, Component: ScanScreen };
    }
  }

  // "/dashboard/[eventCode]"
  if(segments[0] === "dashboard" && segments.length >= 2){
    const eventCode = segments[1];
    return{type: "dashboard", params: {eventCode}, Component: DashboardScreen};
  }

  return null;
}
