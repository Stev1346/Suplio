import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/LandingPage";

export const metadata: Metadata = {
  title: "Suplio | DJ Song Requests and Voting",
  description:
    "Suplio helps DJs run smoother events with QR song requests, crowd voting, and simple event control.",
};

export default function HomePage() {
  return <LandingPage/>;
}