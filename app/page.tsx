import { MarketProvider, MarketPrice } from "@/components/market-quote";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DcfModel } from "@/components/dcf-model";
import { VolModel } from "@/components/vol-model";
import { Orbit, PixelWord, ResearchArt } from "@/components/research-art";
import { centers, feeds, financials, guidance, quotes } from "@/lib/load";
import { MODEL_VERSION, allCases, headlineValue, weightedValue } from "@/lib/dcf";
import { scoreGuidance, STATUS_TONE } from "@/lib/guidance";

function dollars(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function HomePage() {
  const cases = allCases();
  const weighted = weightedValue(cases);
  const lastQuote = quotes.points.at(-1);
  const scored = guidance.items.map((item) => ({ item, score: scoreGuidance(item, guidance.asOf) }));
  return (
    <MarketProvider><div className="home">
      <section className="hero" aria-labelledby="overview-title">
        <span className="crosshair crosshair-tl" aria-hidden="true" /><span className="crosshair crosshair-tr" aria-hidden="true" />
        <span className="crosshair crosshair-bl" aria-hidden="true" /><span className="crosshair crosshair-br" aria-hidden="true" />
        <Orbit />
        <div className="eyebrow">/ An independent look at NASDAQ: NBIS</div>
        <h1 id="overview-title" className="hero-heading">Behind the<br /><span>Nebius <PixelWord /></span></h1>
        <p className="hero-description">What Nebius said it would do.<br />What the numbers actually say.<br />Explore the business, one source at a time.</p>
        <div className="hero-meta">
          <div className="hero-actions">
            <Link className="pill-link" href="/financials">Explore the financials <span aria-hidden="true">↗</span></Link>
            <Link className="pill-link" href="/models">Open the models <span aria-hidden="true">↗</span></Link>
          </div>
          <span className="eyebrow mb-0">Data as of {guidance.asOf} / Educational only</span>
        </div>
      </section>

      <section className="feature-grid" aria-label="Market and valuation overview">
        <article>
          <div className="section-label"><span>/ Market signal</span><span>01</span></div>
          <div className="feature-body">
            <ResearchArt variant="orbit" figure="1" />
            <div className="feature-copy">
              <h2>NBIS.<br />The market view.</h2>
              <MarketPrice>{lastQuote ? <>
                <div className="feature-value">${lastQuote.close.toFixed(2)}</div>
                <p className="feature-note">Last close {lastQuote.date}. {quotes.sourceTitle}. Retrieved {quotes.retrievedAt}.</p>
              </> : <>
                <span className="mb-3"><Badge tone="amber">Awaiting market data</Badge></span>
                <p className="feature-note">The latest snapshot is unavailable. You can still enter a price in the volatility model.</p>
              </>}</MarketPrice>
              <Link href="#short-term" className="pill-link">Explore the range <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </article>
        <article>
          <div className="section-label"><span>/ The company case</span><span>02</span></div>
          <div className="feature-body">
            <ResearchArt variant="wave" figure="2" />
            <div className="feature-copy">
              <h2>Beyond<br />the share price.</h2>
              <div className="feature-value">{dollars(weighted)}</div>
              <p className="feature-note">Model {MODEL_VERSION} weighted arithmetic per share. Bear {dollars(headlineValue(cases[0]))}, base {dollars(headlineValue(cases[1]))}, bull {dollars(headlineValue(cases[2]))}. Not a price target. A negative figure is not floored at zero.</p>
              <Link href="/models" className="pill-link">Inspect the inputs <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </article>
      </section>

      <section aria-label="Research coverage">
        <div className="section-label">/ In the research</div>
        <div className="status-strip">
          <span>Reported quarters <strong>{financials.quarters.length}</strong></span>
          <span>Guidance items <strong>{guidance.items.length}</strong></span>
          <span>Data center sites <strong>{centers.sites.length}</strong></span>
          <span>Public feeds <strong>{feeds.feeds.length}</strong></span>
          <span>Every figure <strong>Source-linked</strong></span>
        </div>
      </section>

      <section aria-labelledby="guidance-title">
        <div className="section-heading"><h2 id="guidance-title">The scorecard</h2><sup>({scored.length})</sup><Link href="/guidance" className="text-link">Full history <span aria-hidden="true">↗</span></Link></div>
        <div className="research-layout">
          <aside className="research-aside">
            <div className="section-label">/ Reading the signals</div>
            <p>Company guidance, measured against reported results. Every revision is dated. Every status has a reason.</p>
            <p>Missing reported numbers stay missing. Estimates appear only in the model, and each one is labeled.</p>
            <div className="aside-links"><Link href="/guidance">[↗] Guidance history</Link><Link href="/methodology">[↗] How we score it</Link></div>
          </aside>
          <div className="overflow-x-auto scorecard">
            <table className="w-full min-w-[720px] text-left text-sm">
              <caption className="sr-only">Nebius guidance targets, current status, and scoring basis</caption>
              <thead><tr>{["Item", "Latest target", "Status", "Basis"].map((heading) => <th scope="col" key={heading} className="px-3">{heading}</th>)}</tr></thead>
              <tbody>{scored.map(({ item, score }) => <tr key={item.id} className="border-b border-line">
                <td className="px-3">{item.title}</td><td className="px-3 text-muted">{item.revisions.at(-1)?.label}</td>
                <td className="px-3"><Badge tone={STATUS_TONE[score.status]}>{score.status}</Badge></td><td className="px-3 text-xs leading-5 text-muted">{score.basis}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="short-term" aria-labelledby="range-title">
        <div className="section-heading"><h2 id="range-title">Model the range</h2><sup>(01)</sup></div>
        <div className="section-label"><span>/ Short term</span><span>Volatility, not a directional forecast</span></div>
        <div className="pt-6"><VolModel closes={quotes.points.map((point) => point.close)} quoteNote={quotes.note} quoteAsOf={quotes.retrievedAt} /></div>
      </section>

      <section aria-labelledby="long-term-title">
        <div className="section-heading"><h2 id="long-term-title">Take the long view</h2><sup>(02)</sup><Link href="/models" className="text-link">All inputs <span aria-hidden="true">↗</span></Link></div>
        <div className="section-label"><span>/ Five-year discounted cash flow</span><span>Company case + editable assumptions</span></div>
        <div className="pt-6"><DcfModel compact /></div>
      </section>

      <section aria-labelledby="feeds-title">
        <div className="section-heading"><h2 id="feeds-title">At the source</h2><sup>({feeds.feeds.length})</sup></div>
        <div className="section-label"><span>/ Public data feeds</span><span>Last retrieved / not a live feed</span></div>
        <ol className="feed-list">
          {feeds.feeds.map((feed, i) => <li key={feed.id} className="feed-row">
            <span className="feed-index">{String(i + 1).padStart(2, "0")}</span><span className="feed-name">{feed.label}</span>
            <span className="feed-date">{feed.updatedAt ?? (feed.id === "quote" ? "See market view" : "Not yet available")}</span>
            <span className="feed-note">{feed.note}</span>
            {feed.sourceUrl ? <a href={feed.sourceUrl} aria-label={`Source for ${feed.label}`}>View ↗</a> : <span />}
          </li>)}
        </ol>
      </section>
    </div></MarketProvider>
  );
}
