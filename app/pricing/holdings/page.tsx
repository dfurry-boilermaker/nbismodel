import { SourceA } from "@/components/metric-value";
import { holdings } from "@/lib/load";

export const metadata = { title: "Other businesses — Nebius model" };

export default function HoldingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <div className="eyebrow">/ 04.4 / Other businesses</div>
        <h1 className="text-3xl font-semibold text-accent">Other businesses and stakes</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Avride and TripleTen are consolidated. Toloka has been an equity stake since May 2025.
          ClickHouse is a minority stake and has been outside the consolidation since the company
          lost significant influence in 2022. Percentages are shown only when a filing states them.
        </p>
      </header>
      {holdings.holdings.map((holding) => (
        <article key={holding.id} className="rounded-xl border border-line bg-panel p-4">
          <h2 className="text-xl font-medium">{holding.name}</h2>
          <p className="mt-2 text-sm text-muted">{holding.relationship}</p>
          <ul className="mt-3 space-y-2 text-sm">
            {holding.metrics.map((metric) => (
              <li key={metric.label}>
                <span className="text-muted">{metric.label}: </span>
                <SourceA source={metric.source} sources={holdings.sources}>
                  {metric.value}
                </SourceA>
              </li>
            ))}
          </ul>
          {holding.unavailable.length ? (
            <div className="mt-3 rounded-md border border-amber/30 p-3 text-sm text-amber">
              <p className="font-medium">Not in the sources reviewed</p>
              <ul className="mt-1 list-disc pl-4">
                {holding.unavailable.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
