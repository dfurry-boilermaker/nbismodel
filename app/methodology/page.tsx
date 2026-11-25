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
      <h2 className="text-lg font-medium text-foreground">Long-term model, version 3.1.0</h2>
      <p>
        Version 3.0.0 showed a bear of −$7.85 raw ($0 shown), a base of −$10.29 raw ($0 shown),
        a bull of $52.54, and a weighted figure of $3.01 raw ($10.51 shown). The bull&apos;s value
        came from selling new shares at the $87.31 close. Version 3.1.0 does not do that.
        The headline is unlevered free cash flow, discounted at the case rate, minus today&apos;s
        debt, plus today&apos;s unrestricted cash and the equity stakes, divided by today&apos;s
        diluted shares. Notes convert only when that value is above the note&apos;s conversion
        price. A share is shown at zero when the raw figure is negative, and the raw figure
        stays on the page. The close on November 24, 2026 was $87.31.
      </p>
      <p>
        On this build the raw values are −$232.96 bear, $196.81 base, and $317.47 bull. Shown,
        those are $0, $196.81, and $317.47. The 30/50/20 weighted figures are $92.01 raw and
        $161.90 shown. The weights are the reviewers&apos; judgment from the prior round. They
        are not management&apos;s probabilities. The base and the bull sit above the $87.31 close.
        That is the arithmetic, not a target.
      </p>
      <p>
        Revenue in every year is average energized megawatts times a contract rate times one
        realization curve. The curve is 25% of the contract rate in 2026, 38% in 2027, then
        50%, 62%, 75%, 88%, and 100% by 2032. It is the same in every case. Full-year engine
        revenue is about $2.3 billion, $3.0 billion, and $3.7 billion in 2026, against guides
        of $3.0 billion, $3.0 billion, and $3.2 billion. In 2027 it is about $9.3 billion,
        $12.4 billion, and $14.7 billion, against $12 billion, $12.5 billion, and $13 billion.
        Each of those is inside a quarter of its guide. 2028 is the next year of the same
        formula, about $12.7 billion, $27.5 billion, and $31.9 billion. It is not a separate
        switch from the guide to full contract value.
      </p>
      <p>
        The furnished letter still describes the low end of a $3.0–3.4 billion 2026 range.
        On the November 12, 2026 call, management said $3.0–3.2 billion. The bull uses the
        call&apos;s high end. Annualized recurring revenue above $7 billion moved from December
        2026 to February 2027. Pre-tax breakeven is guided for the fourth quarter of 2027.
      </p>
      <p>
        Megawatts are not one number. Contracted power was more than 4 GW, with 5 GW expected
        by year-end 2026. Connected power, last guided at 800 MW to 1 GW for year-end 2026,
        was not restated in the third-quarter letter. Active power, the only census, was about
        170 MW at December 31, 2025. The company has not said whether those figures are IT load
        or facility load. The paths here are energized-megawatt assumptions that stop at 3 GW
        in the bear and 5 GW in the base and the bull. The 170 MW census is the start of 2026,
        not a price applied to the whole fleet. Dividing the annualized third-quarter recurring
        run-rate by 170 MW gives about $15.26 million per megawatt. That reading is a check,
        not the contract rate.
      </p>
      <p>
        The contract rate is $20 million in the bear, the second-quarter floor, and $25 million
        in the base and the bull, the third-quarter floor. The margin is 40% through 2027 in
        every case, the group guide, which still carries Avride and TripleTen. From 2028 the
        bear stays at 40%. The base steps to 50%, the second-quarter 2026 AI-cloud margin
        stated on the call. The bull steps to 53.2%, the third-quarter AI-cloud print, which
        includes about $325 million of non-recurring revenue. Stock-based pay is 2% of revenue,
        subtracted from EBITDA, not a 2% haircut of EBITDA.
      </p>
      <p>
        Payback in the third-quarter letter is 1 year and 7 months on comparable one-to-three-year
        deals. It covers operating costs and capex, it is on a revenue basis, it ignores the
        prepayment, and the letter assumes five-year depreciation. The letter does not say
        whether that capex is the server stack, the owned shell, or the whole program. Against
        EBITDA after the 2% stock-based-pay charge, the model&apos;s payback is about 67 months
        in the bear, 38 months in the base, and 33 months in the bull. The gap is the undefined
        scope. The page does not change capex until the model payback equals 19 months.
      </p>
      <p>
        Capex in 2026 and 2027 is the guided dollar amount. From 2028, a new megawatt costs
        $42.5 million in the bear, $37.9 million in the base, and $35 million in the bull.
        $42.5 million is the 2027 midpoint divided by the more-than-1 GW that budget is sized
        for, and it includes land and power for later years. $37.9 million is Samaritan
        Research&apos;s GB200 figure. $35 million is the Bernstein figure cited in secondary
        write-ups. Scotiabank&apos;s published figure is about $40.3 million. Servers and network
        are 69% of that cost, in the Samaritan range and above Scotiabank&apos;s about 64%.
        The old 85% share is not used. A server is refreshed when it is five years old, not
        in the year it is installed. The margin-and-capex grid on the model page marks where
        those choices sit against the $87.31 close.
      </p>
      <p>
        Three customers were 33%, 22%, and 15% of third-quarter revenue. In the bear, the 33%
        customer provides no revenue in 2028 and, after that, is re-let at 75% of the bear
        rate. The 22% and 15% customers are not given a separate switch. There is no Meta
        megawatt cohort: a 120 MW figure was not in the filings used here. The New Jersey
        letter still moves the remaining Microsoft tranches to the second quarter of 2027.
        That timing is inside the energized path. It is not a second revenue haircut.
      </p>
      <p>
        Half of growth capex is modeled as a customer prepayment: cash arrives with the spend
        and is recognized over the next four years. The other part of the 75–85% coverage is
        secured debt at the term loan&apos;s 6.4% hedged coupon. That debt is refinanced, not
        repaid by selling stock. The coupon is shown in the dilution panel and is not deducted
        from free cash flow, because the cash flows are already discounted at 11% or 12%.
        The slice the coverage does not fund is also only in that panel. Selling it at $87.31
        would add shares. The headline share count does not include them. Opening deferred
        revenue of $9.41 billion is removed as it is recognized, once. Equity stakes are the
        year-end 2025 ClickHouse and Toloka carrying amounts plus the $780.6 million nine-month
        revaluation gain, which the release does not split by name. The 9.74 million
        anti-dilutive awards are added as shares. The Citi facility is still undrawn in the
        model, because the draw was not disclosed.
      </p>
      <p>
        A non-zero cost decline cuts the server price and the contract rate by the same factor
        in every year from 2027, including the 2028–2031 megawatts inside the terminal value.
        Facilities do not decline. On the server slice, payback does not change when the
        decline changes. The published cases use a zero decline. Terminal growth is 2%. The
        bear earns no spread over its 12% discount rate. The base and the bull earn 3 points
        over 11%. From 3.0.0 to 3.1.0 the base moved from a raw −$10.29, produced by issuing
        about $165 billion of stock, to a raw $197 on today&apos;s shares. The inputs behind
        that move are the financing treatment, the realization curve, the 50% steady margin,
        and the 69% server share on a $37.9 million build. They were not set to land on $87.31.
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
