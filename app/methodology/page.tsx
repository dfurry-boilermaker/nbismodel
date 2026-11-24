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
        earnings release. GPU counts, other than the company&apos;s own &quot;up to 60,000
        H100-equivalent&quot; capacity remark about Finland, were not scored. Peer GPU prices
        were not collected.
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
      <h2 className="text-lg font-medium text-foreground">Long-term model</h2>
      <p>
        FCFF equals EBITDA minus tax minus capex. Tax is the tax rate times positive EBITDA,
        because depreciation is not forecast; the default rate is zero, so the term is zero
        until you change it. 2026 and 2027 revenue and capex start from the November 12, 2026
        guidance. The 2027 revenue and capex midpoints are averages of the stated ranges, and
        the page says so. Margin after 2026, growth after 2027, the later capex ratio, WACC,
        and terminal growth are assumptions with amber badges. Cash flows sit on December 31
        and are discounted from November 23, 2026 by actual days over 365. Terminal value is
        next year&apos;s FCFF divided by WACC minus growth. Equity value subtracts debt minus
        cash. The share count is the basic count on September 30, 2026, not a diluted count.
        Convertible notes are in the debt number and are not also turned into shares.
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
