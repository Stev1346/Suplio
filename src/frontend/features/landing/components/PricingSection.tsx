import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { landingContent } from "../content";

export function PricingSection() {
  return (
    <section className="mt-16">
      <h2 className="text-center text-primary-40 text-2xl font-semibold">
        Pricing
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {landingContent.pricing.map((tier) => (
          <Card
            key={tier.id}
            className={
              tier.isPopular ? "ring-2 shadow-lg ring-accent-60" : "shadow-lg"
            }
          >
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <p className="text-2xl font-bold">
                {tier.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /{tier.cadence}
                </span>
              </p>
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
            {tier.isPopular ? (
              <div className="flex items-center justify-center rounded-md bg-accent-20/10 w-40 mx-auto">
                <p className="text-accent-40/99 text-lg">Most Popular</p>
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </section>
  );
}
