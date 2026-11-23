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
        <h1 className="text-3xl font-semibold text-accent">Pricing and other revenue lines</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Snapshots live in data/pricing so a later refresh can show a trend. This version has
          one clean snapshot, taken November 23, 2026. A single point is not a trend, and the
          pages say so.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {CARDS.map((card) => (
          <Link key={card.href} href={card.href} className="rounded-xl border border-line bg-panel p-4 no-underline hover:border-accent/50">
            <h2 className="text-lg font-medium text-foreground">{card.title}</h2>
            <p className="mt-2 text-sm text-muted">{card.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
