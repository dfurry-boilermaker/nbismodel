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
      <h2 className="text-lg font-medium text-foreground">Long-term model, version 2.1.0</h2>
      <p>
        Version 2.0.0 subtracted every dollar of growth capex and then kept a heavy capex
        bill in the later years, so every case was negative: about -$285.77 bear, -$175.72
        base, and -$50.13 bull. That failed a sense check against customer prepayments, a
        53.2% AI-cloud EBITDA margin, and the $223.90 reference price on the August 2026
        notes. Version 2.1.0 splits the bill. Growth capex is the cash spent to energize new
        megawatts. Maintenance capex is the gross server-and-network base divided by the
        disclosed five-year life, plus 15% of the 2026–27 budget depreciated over 15 years.
        The 15% share and the 15-year life are assumptions. The five-year life is not.
        After the fleet reaches its case cap, growth capex is zero and only maintenance remains.
      </p>
      <p>
        2026 and 2027 revenue and the 2026–27 capex dollars are the company&apos;s ranges.
        The bear case uses the low ends and the bull case uses the high revenue ends and the
        low capex end. From 2028, revenue is the megawatts already energized times a rate,
        plus half a year on megawatts added that year. The end-2026 fleet earns $8, $10, or
        $12 million per megawatt-year. Megawatts added later earn $12, $20, or $25 million.
        The $20 million and $25 million figures are the Q2 and Q3 2026 new-deal annual-contract-value
        floors, used here as rates rather than as unknown amounts above those floors. The
        lower legacy rates are estimates. Energized megawatts in 2026 were not restated in
        November; the cases use 600, 800, and 1,000 MW. Additions stop at 4, 5, or 6 GW.
        Five gigawatts is the company&apos;s year-end 2026 contracted-power target. Six is an
        assumption that more power is contracted.
      </p>
      <p>
        Tax is not zero. Nebius has not guided a cash rate. The cases use 20%, 15%, and 12%
        as a normalized rate after losses. Free cash flow is after-tax EBIT minus growth
        capex. EBIT uses depreciation equal to that year&apos;s maintenance charge. If
        maintenance free cash flow is positive, the terminal value is a Gordon growth value.
        If it is not, the terminal value is a five-year harvest with no replacement spending.
        Equity value subtracts opening carrying debt and adds unrestricted cash that the
        funding gap did not spend. Future debt is not subtracted a second time, because the
        capex it finances is already in free cash flow. Shares are the basic count plus the
        pre-funded warrants, plus conversion shares in the share-settled bridge, plus any
        residual equity issued at the case&apos;s issue price. The bear case issues that
        residual at $100. The other cases use $223.90.
      </p>
      <p>
        Beside the cash-flow result, 2027 EBITDA and revenue are multiplied by trailing
        EV/EBITDA and EV/revenue for CoreWeave and Oracle, dated in November 2026. A gap
        wider than 50% is marked on the page. IREN is not in the set: publishers disagree
        on whether its EBITDA is positive. The weights are 25%, 50%, and 25%. Nothing here
        is a price target. A negative case is the arithmetic of its stated rates, margins,
        capex, and discount rate.
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
