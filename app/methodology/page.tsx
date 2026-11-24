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
      <h2 className="text-lg font-medium text-foreground">Long-term model, version 2.0.0</h2>
      <p>
        The prior model on this site was an unversioned five-year free-cash-flow sketch. On
        the same November 2026 guidance it produced -$182.00 per basic share in the company
        case, -$350.13 in the bear case, and $27.47 in the bull case. It subtracted all
        capex, held a 40% margin, and put a Gordon terminal value on whatever free cash flow
        was left. It did not split non-recurring revenue, did not depreciate servers over the
        disclosed five-year life, and counted the convertible notes as debt without also
        showing the shares they can become. Figures of $0, $92.74, $579.33, and $162.23 are
        not what that code calculated.
      </p>
      <p>
        Version 2.0.0 keeps free cash flow equal to EBITDA minus capex. Tax stays at zero
        because the company has not guided a cash tax rate, so depreciation does not change
        free cash flow. Depreciation is still computed. Servers and network equipment use the
        five-year life disclosed in the November 12, 2026 financial statements. The
        server-and-network share of capex is not disclosed; the model uses 85% and shows 70%
        and 100% beside it. The other 15% is depreciated over 15 years, which is an assumption.
        Opening gross plant is estimated by annualizing third-quarter depreciation of $354.7
        million and multiplying by those lives.
      </p>
      <p>
        2026 in the forecast is only the rest of the year: the $3.0 billion and $27 billion
        guides minus the nine months already reported. 2027 uses the outlook ranges. The bear
        case takes the low revenue and the high capex. The base case takes the midpoints. The
        bull case takes the high revenue and the low capex, then a lower capex path that the
        company did not guide. It does not use the $3.4 billion top of the 2026 range, because
        the letter says the company expects the low end. It also does not multiply the
        disclosed new-deal price, above $25 million of annual contract value per megawatt, by
        planned gigawatts. That product is far above the $12–13 billion revenue outlook.
      </p>
      <p>
        If replacement capex on the estimated gross base is larger than EBITDA, the terminal
        value is a five-year run-off of exit EBITDA with no further capex. A Gordon growth
        value is used only when maintenance free cash flow is positive. Equity value is
        enterprise value minus carrying debt plus unrestricted cash. Restricted cash of
        $1,215.5 million is not subtracted from debt. The October 2026 Citi facility is a
        $3.5 billion commitment whose drawn amount was not disclosed, so it is not in the debt.
        One bridge leaves the notes outstanding. The other removes their carrying value and
        adds the shares at the initial conversion rates. The headline bear and base cases
        leave the notes outstanding. The headline bull case share-settles them. The weighted
        figure uses 25%, 50%, and 25%. Those weights are an assumption.
      </p>
      <p>
        The residual funding need is capex minus EBITDA minus the stated 2027 coverage, after
        unrestricted cash. It is already in free cash flow as capex, so it is not subtracted a
        second time. Shares are added for that residual only if it would clear at the $223.90
        reference price from the August 2026 notes. In the published cases that price is above
        the model&apos;s per-share arithmetic, so no new shares are added. The result is negative
        in every published case. It is not floored at zero, and it is not a statement that the
        shares trade at zero. Cash flows are discounted from November 24, 2026.
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
