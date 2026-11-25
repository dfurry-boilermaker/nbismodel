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
      <h2 className="text-lg font-medium text-foreground">Long-term model, version 3.0.0</h2>
      <p>
        Version 2.3.0 showed a bear of $109.06, a base of $263.48, a bull of $368.10, and a
        weighted figure of $251.03. Those figures depended on a 25% annual decline in replacement
        cost and on a different revenue-smoothing setting in each case. Version 3.0.0 drops both.
        The baseline cost decline is zero. Revenue after 2027 is energized megawatts times a
        first-year utilization fraction times the contract rate. Displayed value per share is
        floored at zero. The raw figure is on the model page. The close on November 24, 2026
        was $87.31, from Yahoo Finance, StockAnalysis (S&P Global), and FinancialContent.
      </p>
      <p>
        In the published cases the bear and the base are both $0 on the page. The raw figures
        are about −$7.85 and −$10.29. The bull is about $52.54, raw and displayed, against the
        $87.31 close. The weighted figure, at the 30/50/20 weights below, is about $10.51
        displayed and about $3.01 raw. The base raw figure is below the bear raw figure.
        At a $20 million rate and a 40% margin, extra megawatts do not cover $42.5 million of
        all-in capex and the debt that funds them, so the larger build is worth less per share.
        The floor makes both $0.
      </p>
      <p>
        Server dollars per megawatt are held flat in the published cases. Nebius&apos;s own
        annual contract value per megawatt rose, from $20–25 million in the second quarter of
        2026 to more than $25 million in the third, so there is no disclosed series of falling
        dollars per megawatt. NVIDIA&apos;s token-cost comparisons are a cost per unit of compute,
        not a price per megawatt, and they are not used as the deflator. The sensitivity table
        reruns the case at a 0%, 10%, 20%, and 25% decline. The same rate cuts the server cost
        of a new megawatt, the server cost of a refresh, and the contract rate at the next
        re-pricing. Shell and power cost does not decline. On that hardware slice, payback does
        not shorten when the decline rises, because the price falls with the cost.
      </p>
      <p>
        The third-quarter letter puts payback at 1 year and 7 months on comparable one-to-three-year
        deals, covering operating costs and capex, on a revenue basis, and before any prepayment
        benefit. The program capex implied by the 2027 midpoint, $42.5 billion for the more-than-1 GW
        the outlook is sized for, is about $42.5 million per megawatt. Against a $25 million rate
        and a 40% margin, cash payback is about 52 months, outside a ±50% band around 19 months.
        The disclosed payback describes new deals whose prepayments covered the associated capex.
        It is not the average of the 2027 program.
      </p>
      <p>
        The only disclosed active-power census is about 170 MW at December 31, 2025. Dividing the
        annualized third-quarter recurring AI-cloud run-rate by that census gives about $15.26 million
        per megawatt, and that quotient is used only on those 170 MW. It is not applied to the
        800 MW connected-power guide. The guide was not restated in the third-quarter letter.
        The letter says the remaining New Jersey tranches contracted with Microsoft move to the
        second quarter of 2027. In the bear, that slipped tranche is treated as terminated for
        late delivery, left idle through 2027, and re-let in 2028 at three quarters of the bear
        rate. Microsoft and Meta cohorts are re-priced at 2031 and 2032. Three customers were
        33%, 22%, and 15% of third-quarter revenue. The model does not drop that 70% as a block.
        It stresses the slipped New Jersey capacity and the 2031–32 re-pricing.
      </p>
      <p>
        The 2026 margin is the guided 40% in every case. From 2027 the bear and the base stay
        at 40%. The bull uses 50%, the second-quarter 2026 AI-cloud margin, and nothing higher.
        The 53.2% third-quarter cloud margin is the segment print on revenue that includes about
        $325 million of non-recurring partnership revenue. The margin on that revenue was not
        disclosed, so 53.2% is not the ongoing margin. Stock-based pay is 2% of revenue, a
        steady-state assumption. The nine-month cash charge was not in the extracted statements.
        Tax is the Dutch statutory 25.8% after tax depreciation and after interest. Losses add
        to a tax-loss balance that starts at zero. A separate net-operating-loss figure was not
        in the extracted statements. New shares are issued at $87.31 when cash would otherwise
        go negative, and the proceeds bring cash back to zero. Interest is the term loan&apos;s
        6.4% hedged coupon on secured balances, plus the convertible coupons. Notes convert only
        when the model&apos;s own raw value is above that note&apos;s conversion price. Opening
        deferred revenue of $9.41 billion is removed from cash earnings as it is recognized,
        because that cash is already in the September 30 balance. It is not subtracted again.
      </p>
      <p>
        What the funding math includes: the convertible notes at maturity principal, the term
        loan, new secured draws for 75%, 80%, or 85% of growth capex, interest, amortization,
        and equity issued at the market price. What it does not include: draws on the undrawn
        Citi commitment, future at-the-market sales beyond a cash shortfall, and a post-Series D
        ClickHouse share count. Equity stakes are the year-end 2025 ClickHouse and Toloka
        carrying amounts plus the $780.6 million nine-month 2026 revaluation gain. The gain is
        not broken out by name in the earnings release, so applying it to the equity-securities
        line is an assumption. Share-based awards excluded from diluted earnings, 9.74 million
        shares, are added as shares. A split between RSUs and options was not in that footnote.
      </p>
      <p>
        The 2026 letter range is $3.0–3.4 billion, and the letter says the company expects the
        low end. A $3.0–3.2 billion call range was not furnished on EDGAR. Annualized recurring
        revenue above $7 billion moved from December 2026 to February 2027. Pre-tax breakeven
        is guided for the fourth quarter of 2027, after financing costs, on a five-year
        depreciation life. The model&apos;s 2028 revenue is the megawatt engine, not that guide.
        On the base path it is about $46 billion, which is what full contract rates on the
        energized fleet produce. That is above the 2027 guide of about $12.5 billion. The gap
        is the difference between a contract rate and recognized revenue during the ramp, and
        the model does not add a separate smoothing factor to close it.
      </p>
      <p>
        Peer multiples are context. CoreWeave&apos;s 12.2x figure and Oracle&apos;s 12.41x figure
        are trailing multiples, applied to this model&apos;s 2027 EBITDA, discounted to the
        valuation date, and paired with the model&apos;s 2027 net debt. CoreWeave&apos;s 16.79x
        GAAP multiple is not applied to Nebius adjusted EBITDA. At $87.31, Nebius equity on the
        basic economic share count is about $27.4 billion. Adding September 30 carrying net debt
        of about $6.7 billion puts enterprise value near $34.1 billion, about 7.0x the base
        case&apos;s 2027 EBITDA. None of these multiples is a pass-fail test.
      </p>
      <p>
        The weights are 30% bear, 50% base, and 20% bull. They are the weights used by the two
        reviews of version 2.3.0. They are not management&apos;s probabilities and they are not
        this site&apos;s estimate of a chance. Terminal growth is 2% in every case, and new
        capital earns the discount rate, so the growth does not add a spread. In the bull, the
        terminal present value is about 140% of equity value. In the bear and the base, equity
        is negative before the floor, and the sensitivity table shows how that changes if server
        cost and the re-pricing rate decline together.
      </p>
      <p>
        From 2.3.0 to 3.0.0 the base moved from $263.48 to a raw −$10.29, shown as $0. The
        pieces that do not add: removing the 25% cost decline and letting the contract rate
        fall with it when a decline is used; replacing the per-case smoothing factor with
        megawatts times utilization times rate; charging shell and power on megawatts added
        after 2027 at the $42.5 million all-in cost implied by the 2027 midpoint; discounting
        at 11% instead of 10%; taxing at 25.8% with depreciation and losses; charging 2%
        stock-based pay; subtracting deferred revenue from cash earnings once; paying 6.4% on
        new secured debt; issuing shares at $87.31 and crediting the proceeds; and settling
        only notes that are in the money at the model&apos;s own value. Those choices were made
        from the filings and the reviews. They were not set to land on a price.
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
