import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { landingContent } from "../content";

export function PricingSection() {
  return (
    <section className="mt-16">
      <h2 className="text-center text-2xl font-semibold">Pricing</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {landingContent.pricing.map((tier) => (
          <Card
            key={tier.id}
            className={tier.isPopular ? "ring-2 ring-accent-60" : undefined}
          >
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <p className="text-2xl font-bold">
                {tier.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /{tier.cadence}
                </span>
              </p>
              {tier.isPopular ? (
                <p className="text-xs font-medium text-accent-60">Most popular</p>
              ) : null}
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tier.includes.map((line) => (
                  <li key={line} className="text-sm text-muted-foreground">
                    • {line}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}