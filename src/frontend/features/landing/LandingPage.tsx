import Link from "next/link";
import { routes } from "@/lib/shared/constants/routes";
import { Button } from "@/components/ui/Button";
import { landingContent } from "./content";
import { LandingHero } from "./components/LandingHero";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { LandingFooter } from "./components/LandingFooter";
import { PricingSection } from "./components/PricingSection";

export function LandingPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
      <LandingHero />
      <HowItWorksSection />
      <PricingSection />
      <LandingFooter />
    </main>
  );
}