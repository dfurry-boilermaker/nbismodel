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
        top of the range, or more than 2% above a point target, the status is beat. Inside
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
        earnings release.         A third-party transcript of the November 12, 2026 call reports $3.0–3.2 billion.
        That transcript was not filed with the SEC. The letter remains the filed source and
        says the low end of $3.0–3.4 billion. Both are described below. GPU counts, other than the company&apos;s own
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
      <h2 className="text-lg font-medium text-foreground">Educational use only</h2>
      <p>
        The models are educational exercises in valuation arithmetic. The overview includes an illustrative
        12-month price target, not a guarantee, rating, or investment advice, and the site is not an offer to buy
        or sell any security. The values follow from the stated assumptions. Many of those
        assumptions are uncertain. Small changes move the result a lot. The authors may hold
        positions in Nebius Group N.V. or related securities and may trade them without notice.
        The site is not affiliated with Nebius Group N.V.
      </p>
      <h2 className="text-lg font-medium text-foreground">Prices</h2>
      <p>
        Closing price entered manually as of the date shown; not live; may be out of date.
        The reference close used beside the model is $87.31 as of 2026-11-24. It is not used
        to compute the headline value. The overview uses a separately reconstructed, dated CoreWeave comparable.
      </p>
      <h2 id="price-target" className="scroll-mt-24 text-lg font-medium text-foreground">12-month price target</h2>
      <p>All three November 2027 targets use the same formula: modeled FY2028 adjusted EBITDA times a scenario enterprise-value multiple, plus projected unrestricted cash and non-core stakes, less debt and other claims, divided by economic diluted shares. The base is the headline; weights of 35%, 45% and 20% are subjective, not measured probabilities. The forward DCF remains an independent check, not the headline method.</p>
      <p>Comparable anchor: CoreWeave on November 25, 2026, $23.67B market cap (<a href="https://stockanalysis.com/stocks/crwv/statistics/" className="underline">market source</a>), $46.873B reported carrying debt, $0.649B finance leases, $4.122B unrestricted cash and $0.062B securities (<a href="https://www.sec.gov/Archives/edgar/data/1769628/000176962826000461/coreweave3q26earningspress.htm" className="underline">Q3 SEC filing</a>), divided by $17.221B FY2027 consensus EBITDA (<a href="https://www.marketscreener.com/quote/stock/COREWEAVE-INC-185380761/finances/" className="underline">consensus source</a>): approximately 3.9×. Operating leases and restricted cash excluded; differing accounting and timing limit comparability. Consensus is not guidance. Bear 4× approximates this depressed peer valuation; base 4.5× allows a modest execution premium, bull 6× assumes durable growth and a rerating. These multiples are model judgments, not observed future valuations.</p>
      <p>The base applies a 5% FY2027 revenue commissioning/availability haircut to bring the cohort engine into the preliminary $12–13B revenue outlook. Bear and bull are outside that range by design. FY2028 revenue remains a bottom-up capacity/price model, not a management forecast: rapid monetization of previously installed capacity drives the step-up. The overview shows 20% lower EBITDA and a one-turn lower multiple as separate fixed-financing sensitivities.</p>
      <p>The FY2027 year-end financing snapshot proxies November 2027. No further note conversion is assumed before the snapshot; economic if-converted classification is solved at the target value using carrying claims, not the present-day DCF. This is not a prediction of legal conversion timing or settlement. Equity issuance is priced at the November 25 close of $84.99 less a judgmental 20% bear, 10% base, or 0% bull discount. The present-value DCF retains its November 24 reference and separate financing panel. Negative equity is floored at zero; no arbitrary positive floor is imposed. EBITDA excludes GPU refresh, so multiples can overstate value when replacement capex is high. The model is not a fresh balance sheet, and excludes undrawn facilities and unverified subsequent financing.</p>
      <h2 className="text-lg font-medium text-foreground">Raw and floored values</h2>
      <p>
        Each case is shown floored at $0, beside the raw result. A negative raw value means
        the projected cash flows do not cover the obligations and the investment under that
        case. The weighted figure on the page is the weighted average of the floored values.
        The weighted average of the raw values is shown next to it. The headline does not
        clamp the terminal value. A memo shows the bear if that terminal value is clamped at zero.
      </p>
      <h2 className="text-lg font-medium text-foreground">Margin and capacity</h2>
      <p>
        The 2026 group guide is an adjusted EBITDA margin of about 40% (shareholder letter,
        November 12, 2026), and that figure includes Avride and TripleTen. The AI-cloud segment
        printed about 50% in the second quarter of 2026 and 53.2% in the third quarter. The
        third-quarter print includes about $325 million of non-recurring partnership revenue.
        The model&apos;s fourth-quarter 2026 margins are 29.1%, 35.3%, and 40%. For 2027 they are
        36.4%, 45.4%, and 50.4%. From 2029 they are 40%, 50%, and 55%. 2028 is the midpoint
        between 2027 and that steady state. These paths are estimates built from those prints.
      </p>
      <p>
        2026 capex in the letter is about $27 billion. 2027 capex is $40–45 billion, sized for
        more than 1 GW of new capacity. From 2028 the model uses $40, $35, and $31.5 million
        per energized IT megawatt. Seventy percent of that is treated as servers and network,
        refreshed after five years. The other 30% is shell and power, over 15 years. Third-party
        benchmarks, not company figures, put a similar all-in cost near $35 million (Bernstein,
        about November 2025), $37.9 million (Samaritan Research), and $40.3 million (Scotiabank,
        via secondary reports).
      </p>
      <p>
        The letter&apos;s payback is 1 year and 7 months for comparable one-to-three-year deals,
        on a revenue basis, covering operating costs and capex, and excluding prepayments. This is not directly comparable with the model&apos;s compute-only contribution-margin calculation; the company figure covers opex and capex on a revenue basis. The model&apos;s deal-level payback,
        using the server-and-network slice and a contribution margin, is 33.6 months in the bear,
        20.3 months in the base, and 14.8 months in the bull. The base is about 7% longer than
        19 months. The fleet-wide all-in payback is longer because it includes utilization, the
        group margin, and owned shell and power.
      </p>
      <h2 className="text-lg font-medium text-foreground">Financing and dilution</h2>
      <p>
        The company expects prepayments and asset-backed financing to cover 75–85% of 2027
        capex. In the third quarter, prepayments on new deals covered more than 100% of the
        associated capex.         The present-value DCF headline does not depend on issuing new shares; the separate 12-month target does. Prepayments
        enter free cash flow only as the change in deferred revenue. The opening
        current deferred revenue is released from the fourth quarter of 2026 through
        the third quarter of 2027. The opening non-current balance, $7,963.7 million,
        is released evenly from the fourth quarter of 2027 through the third quarter
        of 2031 in every case. New prepayments still use a case-specific recognition
        length. A non-cash financing
        component, estimated at 5% of the average deferred-revenue balance, is deducted because
        the contract rates are on a revenue-recognition basis. Secured draws, coupons, and new
        equity are in a separate panel. Convertible notes count as shares when the model value
        times the conversion shares exceeds carrying value. The June 2029 and June 2031 notes
        are treated as shares in every case. Restricted stock units are included. Options use
        the treasury method at a $90.18 strike.
      </p>
      <h2 className="text-lg font-medium text-foreground">Customer concentration</h2>
      <p>
        In the third quarter of 2026, three customers were 33%, 22%, and 15% of revenue. One
        customer was 75% of receivables. The filings do not name them. In the bear, 100 MW
        tied to the slipped New Jersey tranches are idle for two quarters in 2028 and then
        re-let at 80% of the case rate. That megawatt count is an estimate. From 2029, 15% of
        bear revenue, the smallest of those three customers, is removed for a year and then
        re-let at 80%. Lost revenue keeps 80% of its margin as a cost. The model does not
        stress the 22% customer separately, and it does not model receivables or credit losses.
      </p>
      <h2 className="text-lg font-medium text-foreground">Letter and call</h2>
      <p>
        The shareholder letter and earnings release filed on November 12, 2026 say 2026 revenue
        at the low end of $3.0–3.4 billion. On the earnings call the same day, a third-party
        transcript reports $3.0–3.2 billion. No transcript was filed with the SEC. The model
        does not force either range. Its 2026 engine is about $3.04 billion in the base. Its
        2027 engine is about $12.48 billion after a 5% commissioning/availability haircut, within the $12–13 billion preliminary outlook. A lower-capacity sensitivity scales the megawatt path by 0.62 from 2027; it is not the base case. Annualized run-rate revenue above $7
        billion moved from December 2026 to February 2027. The model does not use that run rate
        as an input.
      </p>
      <h2 className="text-lg font-medium text-foreground">Megawatts</h2>
      <p>
        Contracted power was more than 4 GW on November 12, 2026, with 5 GW expected by year-end.
        Connected power was last guided at 800 MW to 1 GW for year-end 2026 and was not restated
        in the third-quarter letter. Active power, the only census, was about 170 MW at
        December 31, 2025. The company has not said whether those figures are IT load or
        facility load. The model path is energized IT megawatts. Billing starts two quarters
        after energization.         The first three quarters of 2026, 315, 460, and 605 MW, are a
        straight-line estimate from 170 MW to the base year-end path, not a disclosed census.
        Base energized capacity in 2031 and 2032, 5,200 MW and 5,500 MW, is an estimate
        and is not covered by a disclosed contract.
      </p>
      <h2 className="text-lg font-medium text-foreground">Weights</h2>
      <p>
        The weights are 35% bear, 45% base, and 20% bull. They are the authors&apos; judgment,
        set with the help of AI tools, before the results were used to change them. They are
        not a market probability. Each case is shown on its own.
      </p>
      <h2 className="text-lg font-medium text-foreground">Change log</h2>
      <p>Earlier versions are not comparable with this one. They were replaced after review.</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>4.1.0, 2026-11-26. Calibrated base FY2027 revenue, standardized the 12-month target using a reconstructed peer multiple, added target-specific financing and conversion assumptions and sensitivities.</li>
         <li>4.0.0, 2026-11-24. Rebuilt the valuation: financing-neutral cash flow with no share issuance in the headline; a megawatt, utilization, and cohort-price engine with a two-quarter billing lag; prepayments as working capital net of a non-cash financing component; servers and network at 70% of capex; deal payback set next to the disclosed 19 months; price and cost declines on the same start-year index; a customer-concentration stress in the bear; weights 35/45/20. Version 3.1.0, commit 7ba4a47, is superseded.</li>
        <li>3.1.0, 2026-11-24, commit 7ba4a47. Moved share issuance out of the headline. Superseded by 4.0.0.</li>
        <li>3.0.0, 2026-11-24, commit 9424660. Cohort engine and a financing projection. Superseded.</li>
        <li>2.3.0, 2026-11-24, commit 99656b3. Recalibrated. Superseded.</li>
        <li>2.2.0, 2026-11-24, commit 1073b1d. Recalibrated. Superseded.</li>
        <li>2.1.0, 2026-11-24, commit 6e5a408. Rebuilt. Superseded.</li>
        <li>2.0.0, 2026-11-24, commit 4656fb3. Q3 2026 figures sourced. Superseded.</li>
      </ul>
      <h2 className="text-lg font-medium text-foreground">Satellite images</h2>
      <p>
        Images are 10 m crops of public Copernicus Sentinel-2 scenes. Contains modified
        Copernicus Sentinel data 2024 and 2025, processed from the Microsoft Planetary Computer
        mirror. Each frame on the data-centers page carries the same credit and its acquisition
        date. Frames are refreshed at most monthly. They are not a construction survey.
      </p>
      <h2 className="text-lg font-medium text-foreground">Refresh jobs</h2>
      <p>
        scripts/fetch-openrouter.mjs, fetch-token-factory.mjs, and fetch-gpu-pricing.mjs update
        public price JSON. scripts/fetch_satellite.py searches Sentinel-2. Daily closes are manually recorded in a dated snapshot; no live quote feed is configured. Figures from SEC filings are entered by hand. The site
        does not request EDGAR automatically.
      </p>
    </div>
  );
}
