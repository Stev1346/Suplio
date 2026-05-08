import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/shared/constants/routes";
import { landingContent } from "../content";

export function LandingHero() {
  return (
    <section className="space-y-6 text-center">
      <div>
        <h1 className="text-4xl text-primary-20 font-bold tracking-tight sm:text-5xl">
          {landingContent.hero.title}
        </h1>
        <h3 className="text-2xl text-primary-40">
          {landingContent.hero.tagline}
        </h3>
      </div>
      <p className="mx-auto max-w-2xl text-muted-40">
        {landingContent.hero.subcopy}
      </p>
      <div className="grid md:grid-cols-2 w-80 mx-auto gap-3">
        <Button asChild size="lg">
          <Link href={routes.dj.signup}>
            {landingContent.hero.primaryCtaLabel}
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="bg-primary-10 hover:bg-primary-40 hover:border-primary-40"
          size="lg"
        >
          <Link href={routes.dj.login}>
            {landingContent.hero.secondaryCtaLabel}
          </Link>
        </Button>
      </div>
    </section>
  );
}
