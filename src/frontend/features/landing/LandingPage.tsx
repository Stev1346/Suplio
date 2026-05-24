import { LandingHero } from "./components/LandingHero";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { LandingFooter } from "./components/LandingFooter";
import { PricingSection } from "./components/PricingSection";
import { WhySuplioOutcomesSection } from "./components/WhySuplioOutcomesSection";

export function LandingPage() {
  return (
    <main className="mx-auto bg-primary-95 w-full max-w-6xl px-4 py-10 my-14 rounded-md sm:px-6 lg:px-8">
      <LandingHero />
      <WhySuplioOutcomesSection />
      <HowItWorksSection />
      <PricingSection />
      <LandingFooter />
    </main>
  );
}