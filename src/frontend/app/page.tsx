import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/LandingPage";

const landingTitle = "Suplio | DJ Song Requests and Voting";
const landingDescription =
  "Suplio helps DJs run smoother events with QR song requests, crowd voting, and simple event control.";

export const metadata: Metadata = {
  title: landingTitle,
  description: landingDescription,
  openGraph: {
    title: landingTitle,
    description: landingDescription,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: landingTitle,
    description: landingDescription,
  },
};

export default function HomePage() {
  return <LandingPage/>;
}