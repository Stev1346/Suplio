import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/shared/constants/routes";
import { landingContent } from "../content";

export function LandingHero() {
  return (
    <section className="space-y-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {landingContent.hero.tagline}
      </h1>
      <p className="mx-auto max-w-2xl text-muted-foreground">
        {landingContent.hero.subcopy}
      </p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href={routes.dj.signup}>{landingContent.hero.primaryCtaLabel}</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={routes.dj.login}>{landingContent.hero.secondaryCtaLabel}</Link>
        </Button>
      </div>
    </section>
  );
}