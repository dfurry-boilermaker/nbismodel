import { GpuCharts, FactoryCharts, RouterCharts, UsageCharts } from "@/components/pricing-dashboard";
import { gpuPrices, tokenFactory, openRouter } from "@/lib/load";
import Link from "next/link";

export const metadata = { title: "Pricing — Nebius model" };

const CARDS = [
  {
    href: "/pricing/openrouter",
    title: "OpenRouter",
    body: "Models Nebius serves through OpenRouter, its per-token price, and the other providers on the same model.",
  },
  {
    href: "/pricing/token-factory",
    title: "Token Factory",
    body: "Nebius Token Factory, formerly AI Studio. Public catalog prices per million tokens, plus the catalog's tokens-per-second field.",
  },
  {
    href: "/pricing/gpu",
    title: "GPU-hour list prices",
    body: "H100, H200, B200, B300, RTX PRO 6000, and L40S from the compute pricing document. On-demand and preemptible.",
  },
  {
    href: "/pricing/holdings",
    title: "Other businesses and stakes",
    body: "Avride, TripleTen, Toloka, and ClickHouse, with the figures in the Form 20-F and shareholder letters.",
  },
];

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <header>
        <div className="eyebrow">/ 04 / Product economics</div>
        <h1 className="text-3xl font-semibold text-accent">Pricing and other revenue lines</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Explore observed price changes, public token demand, and catalog throughput. Charts show source snapshots and distinguish missing history from zero; a single observation is not a trend.
        </p>
      </header>
      <section className="grid grid-cols-3 gap-2 text-xs">
        {[["GPU",gpuPrices.retrievedAt],["Token Factory",tokenFactory.retrievedAt],["OpenRouter",openRouter.retrievedAt]].map(([label,date])=><div key={label} className="min-w-0 border border-line p-2"><p className="text-muted">{label}</p><p className="font-mono text-[11px]">{date?.slice(0,10)??"—"}</p></div>)}
      </section>
      <nav aria-label="Pricing data pages" className="flex flex-wrap gap-2 text-sm">
        {CARDS.map(card=><Link key={card.href} href={card.href} className="border border-line px-3 py-2 text-muted hover:text-foreground">{card.title} ↗</Link>)}
      </nav>
      <UsageCharts />
      <section className="space-y-3"><h2 className="text-xl">GPU economics</h2><GpuCharts /></section>
      <section className="space-y-3"><h2 className="text-xl">Token Factory economics</h2><FactoryCharts /></section>
      <section className="space-y-3"><h2 className="text-xl">OpenRouter economics</h2><RouterCharts /></section>
      <div className="grid gap-3 sm:grid-cols-2">
        {CARDS.map((card, index) => (
          <Link key={card.href} href={card.href} className="pricing-card">
            <span className="section-label">/ Product {String(index + 1).padStart(2, "0")}</span>
            <h2 className="text-foreground">{card.title}</h2>
            <p className="mt-2 text-sm text-muted">{card.body}</p>
            <span className="text-link">Explore the data <span aria-hidden="true">↗</span></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
