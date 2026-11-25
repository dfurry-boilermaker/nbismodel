import { DcfModel } from "@/components/dcf-model";
import { VolModel } from "@/components/vol-model";
import { REFERENCE_CLOSE } from "@/lib/dcf";
import { quotes } from "@/lib/load";

export const metadata = { title: "Price models — Nebius model" };

export default function ModelsPage() {
  return (
    <div className="space-y-12">
      <header>
        <div className="eyebrow">/ 05 / The model lab</div>
        <h1 className="text-3xl font-semibold text-accent">Model lab</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Educational arithmetic under stated assumptions. Not a price target, a forecast, a
          rating, or a recommendation. Model 4.0.0 is unlevered free cash flow on today&apos;s
          shares. {REFERENCE_CLOSE.label}
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
    </div>
  );
}
