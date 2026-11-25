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
      <h2 className="text-lg font-medium text-foreground">Long-term model, version 2.3.0</h2>
      <p>
        Version 2.2.0 showed −$280.82 bear, −$45.95 base, $347.52 bull, and −$6.30 weighted.
        A negative share price is not a finding. Equity has limited liability, so every
        displayed per-share figure is floored at zero. In the published 2.3.0 cases the
        floor does not bind. The unfloored arithmetic is the same as the figure on the page.
      </p>
      <p>
        Replacement capex is no longer historical cost divided by five. Each year the model
        refreshes one fifth of installed megawatts at a cost per megawatt that falls 25% a
        year. Twenty-five percent is an assumption inside a 20–30% a year band. It is much
        smaller than NVIDIA&apos;s February 16, 2026 statement that Blackwell Ultra can deliver
        up to 35 times lower cost per million tokens than Hopper, and smaller than the
        about 2 times FLOPS-per-dollar step NVIDIA shows for that same generation. Those
        gains include software and rack scale, so they are not used as the capex deflator.
        On the published cases, 2032 cash maintenance is about 10–11% of revenue. CoreWeave&apos;s
        third-quarter 2026 adjusted EBITDA margin was 62%, and Oracle&apos;s trailing EBITDA
        margin through August 2026 was about 53%. Both are still funding a growth build, so
        their current capex intensity is not a maintenance benchmark. A steady-state share
        of revenue around 10% is the check used here.
      </p>
      <p>
        Recurring AI-cloud revenue of $648.7 million, times four, is $2,594.8 million.
        Divided by the only disclosed active-power census, about 170 MW at December 31, 2025,
        that is $15.26 million per MW-year. The denominator is nine months old, so the
        quotient overstates revenue per megawatt of what was actually online in the third
        quarter. Dividing the same revenue by the 800 MW low end of the year-end 2026
        connected-power guide gives $3.24 million. That understates the billing fleet,
        because the guide is not a third-quarter census and later letters said some
        colocation slipped into 2027. The old $4.05 million figure used an interpolated
        641 MW and is not used. Legacy megawatts start at $15.26 million and converge
        toward the case&apos;s contract rate as they rebill. New megawatts earn the contract
        rate, $18 million in the bear, the $20 million Q2 floor in the base, and the $25
        million Q3 floor in the bull.
      </p>
      <p>
        The base margin from 2027 remains 53.2%, fading to 49%. The bear holds 45%, the
        low end of the 2026 cloud prints, rather than the 24% fourth-quarter 2025 trough,
        because that trough does not pay for the guided build. The bear fleet stops at 4 GW,
        2027 capex is $45 billion, and new equity is issued at half the August 2026
        reference price. The bull fleet stops at 5 GW and the margin may reach 55%. The
        weights are 25%, 50%, and 25%. A gap wider than 50% versus a CoreWeave or Oracle
        multiple is marked. Nothing here is a price target.
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
