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
    <section className="mt-16 grid gap-6 md:grid-cols-2">
      <article className="rounded-xl border border-muted-20 p-6">
        <h2 className="text-xl font-semibold">How it works for guests</h2>
        <div className="mt-3">
          <BulletList items={landingContent.howItWorks.guests} />
        </div>
      </article>

      <article className="rounded-xl border border-muted-20 p-6">
        <h2 className="text-xl font-semibold">How it works for DJs</h2>
        <div className="mt-3">
          <BulletList items={landingContent.howItWorks.djs} />
        </div>
      </article>

      <article className="rounded-xl border border-muted-20 p-6 md:col-span-2">
        <h2 className="text-xl font-semibold">Karaoke nights</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {landingContent.howItWorks.karaoke}
        </p>
      </article>
    </section>
  );
}