import Link from "next/link";
import { NewsFeed } from "@/components/news-feed";
import { Badge } from "@/components/ui/badge";
import { DcfModel } from "@/components/dcf-model";
import { VolModel } from "@/components/vol-model";
import { Orbit, PixelWord } from "@/components/research-art";
import { centers, feeds, financials, guidance, quotes } from "@/lib/load";
import { MODEL_VERSION, MARKET_CLOSE, PEER_MULTIPLE, STREET_BENCHMARK, VALUATION_DATE, PRICE_TARGET_DATE, allCases, headlineValue, weightedValue, twelveMonthPriceTarget } from "@/lib/dcf";
import { scoreGuidance, STATUS_TONE, groupGuidance, guidanceStatusLabel } from "@/lib/guidance";

function dollars(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function HomePage() {
  const cases = allCases();
  const weighted = weightedValue(cases);
  const targets = cases.map(twelveMonthPriceTarget);
  const baseTarget = targets[1];
  const targetReturn = (baseTarget.target / MARKET_CLOSE.value - 1) * 100;
  const weightedTarget = targets.reduce((sum, scenario) => sum + scenario.weight * scenario.target, 0);
  const upside = targets[2].target / MARKET_CLOSE.value - 1;
  const downside = 1 - targets[0].target / MARKET_CLOSE.value;
  const scored = groupGuidance(guidance.items, guidance.asOf).flatMap(group => group.items.map((item) => ({ item, score: scoreGuidance(item, guidance.asOf) })));
  return (
    <div className="home">
      <section className="hero min-w-0 space-y-6" aria-labelledby="overview-title">
        <span className="crosshair crosshair-tl" aria-hidden="true" /><span className="crosshair crosshair-tr" aria-hidden="true" />
        <span className="crosshair crosshair-bl" aria-hidden="true" /><span className="crosshair crosshair-br" aria-hidden="true" />
        <Orbit />
        <div className="eyebrow mb-0">/ NBIS · Independent investment research</div>
        <h1 id="overview-title" className="hero-heading">Behind the<br /><span>Nebius <PixelWord /></span></h1>
        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-4">
            <h2 className="text-2xl sm:text-3xl">Demand is not the constraint; delivery is.</h2>
            <p className="text-lg leading-relaxed text-muted">Investment thesis: AI compute demand, rising contract economics and customer-funded capacity underpin a positive absolute-return view. The debate is whether Nebius can commission power on schedule and finance growth without eroding per-share returns.</p>
            <div className="hero-actions">
              <Link className="pill-link" href="/models">Explore the valuation <span aria-hidden="true">↗</span></Link>
              <Link className="pill-link" href="/financials">Reported results <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
          <article className="min-w-0 border border-line bg-panel p-4 sm:p-6">
            <div className="section-label"><span>/ 12-month price target</span><span>Base case · Positive view</span></div>
            <div className="mt-4 break-words font-mono text-5xl tracking-tight text-foreground sm:text-6xl">{dollars(baseTarget.target)}</div>
            <p className={`mt-2 font-mono text-lg ${targetReturn >= 0 ? "text-good" : "text-bad"}`}>{targetReturn >= 0 ? "+" : ""}{targetReturn.toFixed(1)}% implied price change</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
              <div><dt className="text-xs text-muted">Market close · {MARKET_CLOSE.asOf}</dt><dd className="font-mono">${MARKET_CLOSE.value.toFixed(2)}</dd></div>
              <div><dt className="text-xs text-muted">Target date</dt><dd className="font-mono">{PRICE_TARGET_DATE}</dd></div>
            </dl>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3">
              {targets.map(scenario => <div key={scenario.name} className="min-w-0"><div className="text-xs capitalize text-muted">{scenario.name}</div><div className="break-words font-mono text-lg">{dollars(scenario.target)}</div></div>)}
            </div>
            <p className="mt-3 text-xs text-muted">All cases use FY2028 adjusted EBITDA × scenario EV/EBITDA, with modeled cash, debt and dilution. Scenario-weighted sensitivity (not the PT): {dollars(weightedTarget)}. DCF dated {VALUATION_DATE}; market reference dated {MARKET_CLOSE.asOf}; not a live quote or guaranteed return.</p>
            <p className="mt-2 text-xs text-muted">Separate forward DCF distress stress test: {dollars(Math.max(0, targets[0].dcfRaw))} (raw {dollars(targets[0].dcfRaw)}). This is not the headline bear price target.</p>
            <Link href="/methodology#price-target" className="mt-3 inline-block text-sm underline text-muted">Target assumptions and limitations ↗</Link>
          </article>
        </div>
        <div className="section-label"><span>/ Investment debate</span><span>Key drivers</span></div>
        <div className="grid min-w-0 gap-3 md:grid-cols-3">
          <article className="min-w-0 border border-line p-4">
            <div className="eyebrow mb-2">01 / Revenue growth</div>
            <div className="font-mono text-2xl text-good">$12–13B</div>
            <h2 className="mt-2 text-lg">A step change in scale</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">FY2027 revenue outlook versus the low end of $3.0–3.4B for FY2026; delivery and revenue conversion are the next catalysts.</p>
            <Link href="/guidance" className="mt-3 inline-block text-xs underline text-muted">Guidance tracker ↗</Link>
          </article>
          <article className="min-w-0 border border-line p-4">
            <div className="eyebrow mb-2">02 / Capacity</div>
            <div className="font-mono text-2xl text-good">&gt;1 GW / yr</div>
            <h2 className="mt-2 text-lg">Power is the runway</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">Management expects more than 1 GW of new capacity annually. Contracted power is not yet connected or billable capacity.</p>
            <Link href="/guidance" className="mt-3 inline-block text-xs underline text-muted">Capacity milestones ↗</Link>
          </article>
          <article className="min-w-0 border border-line p-4">
            <div className="eyebrow mb-2">03 / Capital productivity</div>
            <div className="font-mono text-2xl text-good">75–85%</div>
            <h2 className="mt-2 text-lg">Customer-supported funding</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">Expected coverage of 2027 CapEx through prepayments and asset-backed financing. The thesis requires returns above the cost of capital after GPU replacement.</p>
            <Link href="/models#capital-efficiency" className="mt-3 inline-block text-xs underline text-muted">Capital efficiency ↗</Link>
          </article>
        </div>
        <div className="border-l-2 border-amber pl-3 text-sm leading-relaxed text-muted">
          <strong className="text-foreground">What could break the thesis:</strong> delayed commissioning, weaker utilization or GPU pricing, customer concentration and $40–45B of expected 2027 CapEx requiring more debt or dilution. The &gt;$7B ARR milestone already shifted to February 2027. Reassess if capacity and cash generation fail to follow spending.
          <p className="mt-2 text-xs">Company outlook from the November 12, 2026 shareholder letter; see the <Link href="/guidance" className="underline">source-linked guidance</Link>. Thesis and price scenarios are independent, AI-assisted research, not company guidance.</p>
        </div>
      </section>

      <section className="min-w-0 border border-line p-4 sm:p-6" aria-label="Risk reward">
        <div className="section-label"><span>/ Risk / reward</span><span>12-month absolute price return</span></div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {targets.map(t => <article key={t.name} className="min-w-0 border border-line p-3"><div className="text-xs capitalize text-muted">{t.name} case</div><div className="mt-1 font-mono text-2xl">{dollars(t.target)}</div><p className="text-sm">{((t.target / MARKET_CLOSE.value - 1) * 100).toFixed(0)}% return · {t.multiple}× FY28E EBITDA</p><p className="mt-2 text-xs text-muted">{t.name === "bear" ? "Supply normalizes; third-party delivery slips; funding becomes more expensive. Going concern, not default." : t.name === "base" ? "2027 guidance delivered; owned-site ramp and high contract pricing sustain growth." : "Faster commissioning, stronger enterprise mix and durable pricing; higher margin and a rerating."}</p></article>)}
        </div>
        <p className="mt-3 text-sm text-muted">Bull upside / bear downside: {downside > 0 ? (upside / downside).toFixed(1) + "×" : "not applicable"}. This is an endpoint ratio, not a probability-adjusted expected return. <strong className="text-foreground">Catalyst path:</strong> February ARR milestone, remaining Microsoft tranches in Q2 2027, 2027 prepayment receipts and Q4 pre-tax breakeven. <a href="https://www.sec.gov/Archives/edgar/data/1513845/000110465926126008/tm2629571d1_ex99-2.htm" className="underline">Company source</a>.</p>
      </section>
      <NewsFeed compact />

      <section className="min-w-0 border border-line p-4 sm:p-6" aria-label="External research benchmark">
        <div className="section-label">/ Street benchmark · Morgan Stanley (reported)</div>
        <p className="mt-2 text-sm text-muted">November 13 coverage of the Q3 note: {dollars(STREET_BENCHMARK.target)} PT, {STREET_BENCHMARK.rating}; {dollars(STREET_BENCHMARK.bear)} bear / {dollars(STREET_BENCHMARK.bull)} bull. The bank reportedly applies 6× FY2028E EBITDA and year-end 2027 net debt. <a href={STREET_BENCHMARK.source} className="underline">Public report</a>. External reference only; independent estimates are not affiliated with Morgan Stanley.</p>
        <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[450px] text-sm"><thead><tr>{["USD B", "2026E", "2027E", "2028E"].map(v=><th key={v} className="p-2 text-left">{v}</th>)}</tr></thead><tbody>{[
          ["Revenue — independent", ...[baseTarget.fy2026,baseTarget.fy2027,baseTarget.fy2028].map(x=>(x/1000).toFixed(2))],
          ["Revenue — MS (reported)", ...STREET_BENCHMARK.revenue.map(x=>(x/1000).toFixed(2))],
          ["Adj. EBITDA — independent", ...["—", (baseTarget.ebitda27/1000).toFixed(2),(baseTarget.nextYearEbitda/1000).toFixed(2)]],
          ["Adj. EBITDA — MS (reported)", ...STREET_BENCHMARK.ebitda.map(x=>(x/1000).toFixed(2))],
        ].map(([label,...vs])=><tr key={label} className="border-t border-line"><th className="p-2 text-left font-normal" scope="row">{label}</th>{vs.map((v,i)=><td key={i} className="p-2 font-mono">{v}</td>)}</tr>)}</tbody></table></div>
        <p className="mt-3 text-xs text-muted">Target history: {STREET_BENCHMARK.prior.map((p,i)=><span key={p.date}>{i>0?" · ":""}<a className="underline" href={p.source}>{p.date}: {dollars(p.target)}</a></span>)} · November 2026: {dollars(STREET_BENCHMARK.target)}. No proprietary research report accessed.</p>
      </section>

      <section className="min-w-0 border border-line p-4 sm:p-6" aria-label="Price target assumptions">
        <div className="section-label">/ Valuation & estimates · USD billions unless indicated</div>
        <p className="mt-2 text-sm text-muted">Secondary CoreWeave spot comparable: {PEER_MULTIPLE.toFixed(1)}× FY2027 consensus EBITDA, using November 25 market capitalization and September 30 filing debt and cash. Primary valuation anchor: reported Morgan Stanley 6× FY2028E EBITDA methodology. Multiples are independent judgments, not bank recommendations. Annual average revenue-eligible capacity is distinct from year-end energized capacity. FY2028 is not company guidance.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead><tr>{["Assumption", "Bear", "Base", "Bull"].map(x => <th key={x} className="p-2">{x}</th>)}</tr></thead>
            <tbody>{[
              ["FY2027 revenue", ...targets.map(x => (x.fy2027 / 1000).toFixed(2))],
              ["FY2028 revenue", ...targets.map(x => (x.fy2028 / 1000).toFixed(2))],
              ["FY2027 avg. revenue-eligible MW", ...targets.map(x=>String(x.mw27))],
              ["FY2028 avg. revenue-eligible MW", ...targets.map(x=>String(x.mw28))],
              ["Utilization assumption", ...targets.map(x=>(x.utilization*100).toFixed(0)+"%")],
              ["Annual revenue per MW at full use ($M)", ...targets.map(x=>x.yieldPerMw.toFixed(1))],
              ["FY2027 adj. EBITDA margin", ...targets.map(x=>(x.margin27*100).toFixed(0)+"%")],
              ["FY2028 adj. EBITDA margin", ...targets.map(x=>(x.margin28*100).toFixed(0)+"%")],
              ["FY2028 revenue growth", ...targets.map(x => ((x.fy2028 / x.fy2027 - 1) * 100).toFixed(0) + "%")],
              ["FY2027 gross capex", ...targets.map(x => (x.capex27 / 1000).toFixed(1))],
              ["FY2027 prepayments", ...targets.map(x => (x.prepay / 1000).toFixed(1))],
              ["FY2027 capex coverage", ...targets.map(x => (x.fundingCoverage * 100).toFixed(0) + "%")],
              ["FY2028 adj. EBITDA", ...targets.map(x => (x.nextYearEbitda / 1000).toFixed(1))],
              ["EV / adj. EBITDA", ...targets.map(x => x.multiple.toFixed(1) + "×")],
              ["Target EV", ...targets.map(x => (x.targetEv / 1000).toFixed(1))],
              ["Debt and other claims", ...targets.map(x => (x.claims / 1000).toFixed(1))],
              ["New equity raised through 2027", ...targets.map(x => (x.equityIssued / 1000).toFixed(1))],
              ["Assumed issue price / share", ...targets.map(x => "$" + x.issuePrice.toFixed(2))],
              ["Target economic shares (M)", ...targets.map(x => (x.shares / 1e6).toFixed(0))],
              ["Target cash + stakes", ...targets.map(x => ((x.cash + x.stakes) / 1000).toFixed(1))],
              ["12-month target / share", ...targets.map(x => dollars(x.target))],
              ["If EBITDA 20% lower / share", ...targets.map(x => dollars(x.lowerEbitdaTarget))],
              ["If multiple 1× lower / share", ...targets.map(x => dollars(x.lowerMultipleTarget))],
              ["Separate DCF scenario / share (raw)", ...targets.map(x => dollars(x.dcfRaw))],
            ].map(([label, ...values]) => <tr key={label} className="border-t border-line"><th scope="row" className="p-2 font-normal text-muted">{label}</th>{values.map((v,i) => <td key={i} className="p-2 font-mono">{v}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">Sensitivities hold the financing snapshot fixed; actual financing needs may worsen with lower EBITDA. EBITDA ignores GPU replacement capex. See <Link href="/methodology#price-target" className="underline">sources, model inputs and limitations</Link>.</p>
      </section>

      <section className="min-w-0 border border-line p-4 sm:p-6" aria-label="Present value cross-check">
        <div className="section-label"><span>/ Long-term intrinsic value cross-check</span><span>DCF {MODEL_VERSION}</span></div>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <span className="font-mono text-3xl">{dollars(weighted)}</span>
          <span className="text-sm text-muted">Weighted present value per share · Severe bear stress {dollars(headlineValue(cases[0]))} / Base {dollars(headlineValue(cases[1]))} / Bull {dollars(headlineValue(cases[2]))}</span>
        </div>
        <p className="mt-2 text-xs text-muted">Floored present-day DCF outputs, including the severe bear stress, distinct from the forward 12-month targets above. The DCF headline excludes future equity issuance. <Link href="/models" className="underline">Inspect the model ↗</Link></p>
      </section>

      <section aria-label="Research coverage">
        <div className="section-label">/ In the research</div>
        <div className="status-strip">
          <span>Reported quarters <strong>{financials.quarters.length}</strong></span>
          <span>Guidance items <strong>{guidance.items.length}</strong></span>
          <span>Data center sites <strong>{centers.sites.length}</strong></span>
          <span>Public feeds <strong>{feeds.feeds.length}</strong></span>
          <span>Reported figures <strong>Source-linked</strong></span>
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
                <td className="px-3"><Badge tone={STATUS_TONE[score.status]}>{guidanceStatusLabel(score.status)}</Badge></td><td className="px-3 text-xs leading-5 text-muted">{score.basis}</td>
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
        <div className="section-label"><span>/ Long-term discounted cash flow</span><span>Company case + editable assumptions</span></div>
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
    </div>
  );
}
