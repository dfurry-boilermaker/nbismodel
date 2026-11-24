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
          recommendation. Model 2.0.0 starts from the November 12, 2026 outlook and the
          September 30, 2026 balance sheet. Figures after 2027, the 85% server-and-network
          share, the discount rate, and the 25/50/25 weights are assumptions. A negative
          result is shown as negative.
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
