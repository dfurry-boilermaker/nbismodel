"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CASES,
  MODEL_VERSION,
  VALUATION_DATE,
  allCases,
  assumptionSensitivity,
  headlineValue,
  runCase,
  waccGrowthGrid,
  weightedValue,
  type CaseName,
} from "@/lib/dcf";
import { formatCompactUsd } from "@/lib/utils";

function money(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function DcfModel({ compact = false }: { compact?: boolean }) {
  const results = useMemo(() => allCases(), []);
  const weighted = useMemo(() => weightedValue(results), [results]);
  const [name, setName] = useState<CaseName>("base");
  const result = useMemo(() => runCase(name), [name]);
  const bridge = result.bridges[result.headline];
  const grid = useMemo(() => waccGrowthGrid("base"), []);
  const alts = useMemo(() => assumptionSensitivity(), []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Model {MODEL_VERSION}, discounted from {VALUATION_DATE}. The figures are the arithmetic of
        the November 12, 2026 outlook and the assumptions listed under each case. They are not a
        price target, a forecast that the shares trade at these levels, or a recommendation.
        A negative figure is not floored at zero.
      </p>
      <div className="grid gap-3 sm:grid-cols-4">
        {results.map((row) => (
          <button
            key={row.name}
            type="button"
            onClick={() => setName(row.name)}
            className={`rounded-lg border p-3 text-left ${name === row.name ? "border-accent" : "border-line"}`}
          >
            <div className="text-xs uppercase tracking-wide text-muted">
              {row.name} · {Math.round(CASES[row.name].weight * 100)}%
            </div>
            <div className="mt-1 font-mono text-xl">{money(headlineValue(row))}</div>
            <div className="text-xs text-muted">{row.headline === "all" ? "Notes share-settled" : "Notes outstanding"}</div>
          </button>
        ))}
        <div className="rounded-lg border border-line bg-panel p-3">
          <div className="text-xs uppercase tracking-wide text-muted">Weighted</div>
          <div className="mt-1 font-mono text-xl">{money(weighted)}</div>
          <div className="text-xs text-muted">25 / 50 / 25, an assumption</div>
        </div>
      </div>
      {compact ? (
        <p className="text-sm text-muted">
          {CASES[name].summary} Funding still required in this case: {formatCompactUsd(bridge.fundingGap)}.
          {" "}{bridge.fundingNote}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {(["bear", "base", "bull"] as const).map((caseName) => (
              <Button key={caseName} type="button" size="sm" variant={name === caseName ? "default" : "outline"} aria-pressed={name === caseName} onClick={() => setName(caseName)}>
                {caseName}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted">{CASES[name].summary}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Enterprise value" value={formatCompactUsd(result.enterpriseValue)} />
            <Stat label="Equity value" value={formatCompactUsd(bridge.equityFirm)} />
            <Stat label="Per share" value={money(bridge.perShare)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <BridgeCard title="Notes outstanding" value={result.bridges.none} />
            <BridgeCard title="All notes share-settled" value={result.bridges.all} />
          </div>
          <p className="text-sm text-muted">{bridge.fundingNote}</p>
          <p className="text-sm text-muted">
            Free cash flow is EBITDA minus capex. Tax is zero because no cash tax rate was guided,
            so depreciation does not change free cash flow. It is shown because the company
            depreciates servers and network gear over five years, and because the steady-state
            check uses that life. 2026 is only the remainder of the year: the guided $3.0 billion
            and $27 billion minus the nine months already reported. Cash flows sit on December 31
            and are discounted from {VALUATION_DATE}. The terminal method on this case is{" "}
            {result.terminalMethod === "runoff"
              ? "a five-year run-off of exit EBITDA with no replacement capex, because replacement capex on the estimated gross base is larger than EBITDA."
              : "a Gordon growth value, because maintenance free cash flow is positive."}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr>
                  {["Year", "Revenue", "EBITDA", "Depreciation", "Cash coupons", "Pretax", "Capex", "Covered", "FCFF", "PV"].map((heading) => (
                    <th key={heading} className="border-b border-line px-2 py-2 font-medium">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono text-[13px]">
                {result.years.map((row) => (
                  <tr key={row.year} className="border-b border-line/70">
                    <td className="px-2 py-2">{row.label}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.revenue)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.ebitda)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.depreciation)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.cashInterest)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.pretax)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.capex)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.covered)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.fcff)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.pv)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="px-2 py-2" colSpan={8}>Terminal value / present value of terminal</td>
                  <td className="px-2 py-2">{formatCompactUsd(result.terminalValue)}</td>
                  <td className="px-2 py-2">{formatCompactUsd(result.pvTerminal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Base case per share at other WACC and terminal growth</h3>
            <p className="mb-2 text-xs text-muted">Notes outstanding. Terminal growth only changes the Gordon path; this base case uses the run-off when maintenance free cash flow is negative, so some cells match.</p>
            <table className="text-sm">
              <thead className="text-xs text-muted">
                <tr>
                  <th className="px-2 py-1 text-left">WACC \ g</th>
                  {[2, 3, 4].map((growth) => (
                    <th key={growth} className="px-2 py-1 text-right">{growth}%</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono">
                {grid.map((row) => (
                  <tr key={row[0].wacc}>
                    <td className="px-2 py-1">{Math.round(row[0].wacc * 100)}%</td>
                    {row.map((cell) => (
                      <td key={cell.growth} className="px-2 py-1 text-right">{cell.perShare == null ? "—" : money(cell.perShare)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">What moves the base case</h3>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-2 py-1 text-left">Change</th>
                  <th className="px-2 py-1 text-right">Per share</th>
                  <th className="px-2 py-1 text-right">Funding residual</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {alts.map((row) => (
                  <tr key={row.label} className="border-t border-line/70">
                    <td className="px-2 py-1 font-sans">{row.label}</td>
                    <td className="px-2 py-1 text-right">{money(row.perShare)}</td>
                    <td className="px-2 py-1 text-right">{formatCompactUsd(row.fundingGap)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-muted">
              Coverage changes the residual that still has to be raised. It does not change unlevered
              free cash flow, because the capex is still spent. The 85% server-and-network share is an
              estimate. Nebius has not disclosed that split. The five-year life is the disclosed life
              for servers and network equipment. The 15-year life on the rest is an assumption.
            </p>
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            <li>2026 revenue $3.0 billion is the low end the November 12, 2026 letter says the company expects. The $3.4 billion top was not withdrawn and is not used as the bull case.</li>
            <li>Third-quarter reported revenue was $980.8 million, of which $325.1 million was non-recurring partnership revenue. The annual outlook is not reduced by that amount here, because the company did not restate the outlook net of it.</li>
            <li>New-deal annual contract value was above $25 million per MW. The model does not multiply that by gigawatts. Doing so would put 2027 revenue far above the $12–13 billion outlook.</li>
            <li>Cash coupons use the disclosed note coupons and the term loan at the swapped 3.9% SOFR plus 2.50%. The October 22, 2026 Citi facility is a $3.5 billion commitment. The amount drawn was not disclosed, so it is not in the debt.</li>
            <li>Restricted cash of $1,215.5 million is not netted against debt.</li>
            <li>Weights of 25%, 50%, and 25% are an assumption, not an implied probability.</li>
          </ul>
          <Badge tone="amber">Assumptions in the year table after 2027 are not Nebius guidance</Badge>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-3">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 font-mono text-xl">{value}</div>
    </div>
  );
}

function BridgeCard({ title, value }: { title: string; value: { perShare: number; equityFirm: number; netDebt: number; shares: number; convertShares: number; fundingGap: number } }) {
  return (
    <div className="rounded-lg border border-line p-3 text-sm">
      <div className="font-medium">{title}</div>
      <div className="mt-1 font-mono text-lg">{money(value.perShare)}</div>
      <p className="mt-1 text-xs text-muted">
        Equity {formatCompactUsd(value.equityFirm)} · net debt {formatCompactUsd(value.netDebt)} ·{" "}
        {(value.shares / 1e6).toFixed(1)} million shares
        {value.convertShares ? `, including ${(value.convertShares / 1e6).toFixed(1)} million conversion shares` : ""}.
        Residual to fund {formatCompactUsd(value.fundingGap)}.
      </p>
    </div>
  );
}
