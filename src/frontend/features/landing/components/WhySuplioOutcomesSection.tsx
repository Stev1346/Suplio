import { landingContent } from "../content";

export function WhySuplioOutcomesSection() {
  return (
    <section className="mt-16 space-y-4">
      <h2 className="text-2xl text-primary-20 font-semibold text-center">
        Why Suplio
      </h2>

      <ul className="mx-auto grid max-w-3xl grid-cols-1 gap-4 text-center sm:grid-cols-3">
        {landingContent.outcomes.map((outcome) => (
          <li
            key={outcome}
            className="text-base text-muted-foreground transition-transform duration-200 ease-out hover:scale-125 motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            {outcome}
          </li>
        ))}
      </ul>
    </section>
  );
}
