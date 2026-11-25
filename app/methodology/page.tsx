import { sourceOf } from "@/lib/load";

export const metadata = { title: "Methodology — Nebius model" };

export default function MethodologyPage() {
  const filing = sourceOf("edgar");
  const report = sourceOf("f20-2025");
  return (
    <div className="max-w-3xl space-y-6 text-sm leading-7">
      <div className="eyebrow">/ 06 / Research notes</div>
        <h1 className="text-3xl font-semibold text-accent">Methodology and sources</h1>
      <p>
        Nebius Group N.V. is CIK 0001513845, file number 001-35173. It is a Dutch foreign
        private issuer. The periodic reports are Form 20-F, not Form 10-K. Quarterly results
        are furnished on Form 6-K, not Form 10-Q. The{" "}
        <a href={filing?.url}>EDGAR company page</a> is the filing index. The current annual
        report used for segments and stakes is the{" "}
        <a href={report?.url}>Form 20-F for the year ended December 31, 2025</a>, filed
        April 30, 2026. A May 22, 2026 Form 20-F/A only added a clawback-policy exhibit.
      </p>
      <p>
        Quarterly numbers are taken from the earnings-release PDFs linked on{" "}
        <a href="https://nebius.com/financials">nebius.com/financials</a>, cross-checked so
        that the four 2025 quarters of revenue, adjusted EBITDA, and net income sum to the
        full-year figures in the Q4 2025 release ($529.8 million, $(64.9) million, and $29.0
        million). From the second quarter of 2025, Toloka is a discontinued operation. Later
        releases recast earlier quarters. Where the first release differs, both numbers are
        kept and the later one is the primary figure.
      </p>
      <h2 className="text-lg font-medium text-foreground">Guidance status</h2>
      <p>
        A guidance item is a dated revision with a low, a high, or both, and a period end.
        The score uses only the latest revision. If that revision replaces the target, the
        status is superseded. If the company moved the schedule and the new date has not
        arrived, the status is behind. If the period has ended and the actual is above the
        top of the range, or more than 2% above a point target, the status is ahead. Inside
        the range, or at or above a minimum, is met. Below the floor is missed. If the period
        ended and no number was disclosed, the status is undisclosed. Otherwise it is open,
        including when the only actual is a year-to-date figure and the year is not over.
        The site does not mark a year &quot;on track&quot; by extrapolating the latest quarter.
      </p>
      <h2 className="text-lg font-medium text-foreground">What was not copied in</h2>
      <p>
        A November 11, 2025 earnings-call remark that 2025 capex was raised from about $2
        billion to about $5 billion, and a full-year 2025 revenue range of $500–550 million,
        show up in secondary transcripts. They were not in the shareholder-letter text
        extracted for this version, so they are not in the tracker. Actual 2025 capex of
        $4,066 million and revenue of $529.8 million are on the financials page, from the
        earnings release. A full-year 2026 range of $3.0–3.2 billion is sometimes attributed
        to the November 12, 2026 call. The furnished letter says the low end of $3.0–3.4
        billion. No call transcript was furnished on EDGAR through November 24, 2026, so the
        narrower range is not given a row. GPU counts, other than the company&apos;s own
        &quot;up to 60,000 H100-equivalent&quot; capacity remark about Finland, were not scored.
      </p>
      <h2 className="text-lg font-medium text-foreground">Prices</h2>
      <p>
        Token Factory prices come from the public catalog at tokenfactory.nebius.com, which
        robots.txt allows. GPU rates come from the markdown form of the compute pricing
        document, which the docs site allows. OpenRouter prices come from the public models
        API and each model&apos;s endpoints API. Prompt prices there are USD per token; the
        page multiplies by one million for display. History files append a snapshot only when
        the fetch script is run again. One snapshot cannot show a trend.
      </p>
      <h2 className="text-lg font-medium text-foreground">Share price and the short-term band</h2>
      <p>
        Yahoo Finance supplies the regular-session share price and completed daily closes.
        A scheduled job refreshes the snapshot every half hour during Nasdaq sessions, including
        a closing snapshot. A failed refresh leaves the previous snapshot and trade timestamp in place.
        The optional Finnhub or Alpha Vantage daily-close file provides a fallback. Realized volatility is
        the sample standard deviation of log returns, annualized with sqrt(252), and it needs
        20 closes. The band is price × exp(±1.96 × volatility × sqrt(days / 252)), with zero
        drift. Implied volatility has no feed.
      </p>
      <h2 className="text-lg font-medium text-foreground">Long-term model, version 2.2.0</h2>
      <p>
        Version 2.1.0 was −$232.41 bear, −$65.31 base, $933.48 bull, and $142.61 weighted.
        The bull applied a $25 million rate on the way to 6 GW, so the terminal sat far
        above a multiple of 2027 EBITDA. Version 2.2.0 keeps the same split between growth
        capex and five-year maintenance. It changes the rates and the speed at which
        recognized revenue approaches the megawatt ceiling.
      </p>
      <p>
        Recurring AI-cloud revenue in the third quarter of 2026 was $648.7 million. Times
        four is $2,594.8 million. Active power was about 170 MW at the end of 2025, and the
        connected-power guide for the end of 2026 was 800 MW to 1 GW. September 30, 2026 is
        day 273, so a straight line from 170 MW to the 800 MW low end is 641 MW. Dividing
        gives $4.05 million per MW-year. That is an estimate of recognized revenue on the
        fleet then in service. It is not the new-deal contract value, which the letters put
        above $20 million in the second quarter and above $25 million in the third. Legacy
        megawatts earn $4.05 million in every case. Only megawatts added after 2026 earn the
        contract rate, and each year the model recognizes part of the gap up to that ceiling
        rather than the whole ceiling at once.
      </p>
      <p>
        The 2026 group margin stays at the guided 40%, because nine months are already
        reported. From 2027 the base uses the 53.2% AI-cloud adjusted EBITDA margin in the
        November 12, 2026 shareholder letter, and fades to 49%. The four-point fade is for
        power cost and for the group businesses that still lose money. It is not a return
        to the older 40% group guide. The bull may rise from 53.2% to 55%, and no higher.
        The bear uses 45% in 2027, the first-quarter 2026 core print, and 24% at the
        terminal, the fourth-quarter 2025 core print. That 24% is the bottom of the
        disclosed positive cloud-margin history. The bear issues residual equity at $111.95,
        half the August 24, 2026 reference price of $223.90. The bull fleet stops at 5 GW,
        the contracted-power target, not 6 GW.
      </p>
      <p>
        Tax rates of 20%, 15%, and 12% are still labeled assumptions. Nebius has not guided
        a cash rate. The bridge is unchanged: enterprise value, minus opening carrying debt,
        plus unrestricted cash left after the funding gap. Future debt is not subtracted
        again. The weights are 25%, 50%, and 25%. The page shows how many dollars of the
        weighted figure come from each case. A gap wider than 50% versus a CoreWeave or
        Oracle multiple is marked. Nothing here is a price target.
      </p>
      <h2 className="text-lg font-medium text-foreground">Satellite images</h2>
      <p>
        The Mäntsälä frames are Copernicus Sentinel-2 L2A scenes, 10 m pixels, cropped to
        about two kilometers around Moreenikatu 6. The address is the Finnish business
        register entry for Nebius DC Oy. The coordinate is the OpenStreetMap way published
        for that address. Image bytes are rendered from Microsoft Planetary Computer, which
        mirrors the Copernicus archive, because a Copernicus Data Space download needs an
        account. The scene id and acquisition time are the Sentinel product metadata. Cloud
        cover is the scene-level percentage. The pictures are not a construction survey.
      </p>
      <h2 className="text-lg font-medium text-foreground">Adding a quarter or a guidance item</h2>
      <p>
        Edit data/financials.json or data/guidance.json. Keep the source id in the sources
        map, with the URL and the document date. Run <span className="font-mono">npm run validate</span>.
        The validator checks that the 2025 quarters still sum to the full-year totals and that
        every source id used by a figure exists. Do not put a number in a cell you cannot link.
      </p>
      <h2 className="text-lg font-medium text-foreground">Refresh jobs</h2>
      <p>
        scripts/fetch-openrouter.mjs, fetch-token-factory.mjs, fetch-gpu-pricing.mjs, and
        fetch-quote.mjs update the JSON. scripts/fetch_satellite.py searches Sentinel-2 and,
        when GDAL is installed, writes a new crop. Vercel Cron calls /api/cron/[job]. On
        Vercel the filesystem is read-only, so the route does not pretend to save. The
        GitHub Action in .github/workflows/refresh-public-data.yml is what commits new
        snapshots. CRON_SECRET, FINNHUB_API_KEY, ALPHAVANTAGE_API_KEY, CDSE_CLIENT_ID, and
        CDSE_CLIENT_SECRET are optional and documented in .env.example.
      </p>
    </div>
  );
}
