import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DcfModel } from "@/components/dcf-model";
import { VolModel } from "@/components/vol-model";
import { feeds, guidance, quotes } from "@/lib/load";
import { COMPANY_CASE, runDcf } from "@/lib/dcf";
import { scoreGuidance, STATUS_TONE } from "@/lib/guidance";
import { formatCompactUsd } from "@/lib/utils";

export default function HomePage() {
  const dcf = runDcf(COMPANY_CASE);
  const scored = guidance.items.map((item) => ({
    item,
    score: scoreGuidance(item, guidance.asOf),
  }));
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight text-accent sm:text-4xl">
          What Nebius said it would do, and what it has reported.
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
          Nebius Group N.V. (NASDAQ: NBIS) files as a foreign private issuer, on Forms 20-F
          and 6-K. This site keeps those figures, the guidance around them, and the public
          prices of the products Nebius sells. Empty cells are empty because the number was
          not in a source we could use. They are not estimates.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-line bg-panel p-4">
          <h2 className="text-lg font-medium">NBIS price</h2>
          {quotes.points.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-amber">
              No share price is stored. A quote was not scraped from Yahoo, Nasdaq, or Stooq.
              Stooq&apos;s robots.txt disallows general crawlers. Set FINNHUB_API_KEY or
              ALPHAVANTAGE_API_KEY and run <span className="font-mono">scripts/fetch-quote.mjs</span>.
            </p>
          ) : (
            <p className="mt-3 font-mono text-3xl">
              {quotes.points.at(-1)?.close.toFixed(2)}
              <span className="mt-1 block text-xs text-muted">
                Last close {quotes.points.at(-1)?.date}, retrieved {quotes.retrievedAt}. {quotes.sourceTitle}
              </span>
            </p>
          )}
        </article>
        <article className="rounded-xl border border-line bg-panel p-4">
          <h2 className="text-lg font-medium">Long-term model, company case</h2>
          {dcf.ok ? (
            <p className="mt-3 font-mono text-3xl">
              {formatCompactUsd(dcf.perShare)}
              <span className="mt-1 block font-sans text-xs font-normal text-muted">
                Per basic share, using guided 2026–2027 revenue and capex plus the assumptions
                listed on the models page. Not a price target.
              </span>
            </p>
          ) : (
            <p className="mt-3 text-bad">{dcf.reason}</p>
          )}
          <Link href="/models" className="mt-3 inline-block text-sm">
            Open the inputs and the math
          </Link>
        </article>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Short-term range</h2>
        <VolModel
          closes={quotes.points.map((point) => point.close)}
          quoteNote={quotes.note}
          quoteAsOf={quotes.retrievedAt}
        />
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-medium">Guidance scorecard</h2>
          <Link href="/guidance" className="text-sm">
            History of each item
          </Link>
        </div>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-panel text-xs uppercase tracking-wide text-muted">
              <tr>
                {["Item", "Latest target", "Status", "Why"].map((heading) => (
                  <th key={heading} className="px-3 py-2 font-medium">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scored.map(({ item, score }) => {
                const latest = item.revisions.at(-1);
                return (
                  <tr key={item.id} className="border-t border-line/80">
                    <td className="px-3 py-2">{item.title}</td>
                    <td className="px-3 py-2 text-muted">{latest?.label}</td>
                    <td className="px-3 py-2">
                      <Badge tone={STATUS_TONE[score.status]}>{score.status}</Badge>
                    </td>
                    <td className="px-3 py-2 text-muted">{score.basis}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-medium">Long-term summary</h2>
        <p className="mb-3 text-sm text-muted">
          The same company-case model as the card above. Change any input on the models page.
        </p>
        <DcfModel compact />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">When each feed was last updated</h2>
        <ul className="divide-y divide-line rounded-xl border border-line">
          {feeds.feeds.map((feed) => (
            <li key={feed.id} className="grid gap-1 px-3 py-3 sm:grid-cols-[180px_140px_1fr] sm:items-baseline">
              <span className="font-medium">{feed.label}</span>
              <span className="font-mono text-xs text-muted">{feed.updatedAt ?? "not yet"}</span>
              <span className="text-sm text-muted">
                {feed.note} {feed.sourceUrl ? <a href={feed.sourceUrl}>Source</a> : null}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
