import { Card } from "@/components/ui/card";
import { landingContent } from "../content";

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="text-sm text-muted-foreground">
          • {item}
        </li>
      ))}
    </ul>
  );
}

export function HowItWorksSection() {
  return (
    <section className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="rounded-xl border border-muted-90 p-6 shadow-lg">
        <h2 className="text-xl text-secondary-40 font-semibold">Guest Experience</h2>
        <div className="mt-3">
          <BulletList items={landingContent.howItWorks.guests} />
        </div>
      </Card>

      <Card className="rounded-xl border border-muted-90 p-6 shadow-lg">
        <h2 className="text-xl text-secondary-40 font-semibold">DJ Experience</h2>
        <div className="mt-3">
          <BulletList items={landingContent.howItWorks.djs} />
        </div>
      </Card>

      <Card className="rounded-xl border border-muted-90 p-6 shadow-lg">
        <h2 className="text-xl text-accent-40 font-semibold">Karaoke nights</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {landingContent.howItWorks.karaoke}
        </p>
      </Card>
    </section>
  );
}