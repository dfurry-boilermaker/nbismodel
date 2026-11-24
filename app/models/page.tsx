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
          recommendation. The company case starts from guidance and the September 30, 2026
          balance sheet. Yellow badges are assumptions you can edit. They are not Nebius figures.
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
