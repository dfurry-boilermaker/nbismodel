import { MarketProvider } from "@/components/market-quote";
import { DcfModel } from "@/components/dcf-model";
import { VolModel } from "@/components/vol-model";
import { quotes } from "@/lib/load";

export const metadata = { title: "Price models — Nebius model" };

export default function ModelsPage() {
  return (
    <MarketProvider><div className="space-y-12">
      <header>
        <div className="eyebrow">/ 05 / The model lab</div>
        <h1 className="text-3xl font-semibold text-accent">Price models</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Both models show the inputs and the arithmetic. Nothing here is a price target or a
          recommendation. Model 3.0.0 prices 2026 and 2027 from the company outlook and later
          years from energized megawatts, utilization, and the contract rate. The baseline
          does not cut server cost. A share is shown at zero if the arithmetic is negative,
          and the raw figure is on the page. The November 24, 2026 close was $87.31.
        </p>
      </header>
      <section className="space-y-3">
        <h2 className="text-xl font-medium">Short term: a volatility band</h2>
        <VolModel
          closes={quotes.points.map((point) => point.close)}
          quoteNote={quotes.note}
          quoteAsOf={quotes.retrievedAt}
        />
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-medium">Long term: scenarios and a DCF</h2>
        <DcfModel />
      </section>
    </div></MarketProvider>
  );
}
