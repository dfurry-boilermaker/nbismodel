"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CASES,
  MARKET_PRICE,
  MODEL_VERSION,
  VALUATION_DATE,
  allCases,
  declineSensitivity,
  headlineValue,
  marginCapexGrid,
  marketMultiple,
  peerCrossCheck,
  rawHeadline,
  runCase,
  waccGrowthGrid,
  weightedRaw,
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
  const weightedUnfloored = useMemo(() => weightedRaw(results), [results]);
  const [name, setName] = useState<CaseName>("base");
  const result = useMemo(() => runCase(name), [name]);
  const bridge = result.bridges.none;
  const peers = useMemo(() => peerCrossCheck(result), [result]);
  const market = useMemo(() => marketMultiple(result), [result]);
  const grid = useMemo(() => waccGrowthGrid(), []);
  const declines = useMemo(() => declineSensitivity(name), [name]);
  const capexGrid = useMemo(() => marginCapexGrid(), []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Model {MODEL_VERSION}, discounted from {VALUATION_DATE}. The close that day was {money(MARKET_PRICE)}.
        The headline is unlevered free cash flow on today&apos;s shares. It does not assume a future stock sale.
        This is educational arithmetic, not a price target.
      </p>
      <details className="text-sm text-muted">
        <summary className="cursor-pointer">Unfloored arithmetic</summary>
        <p className="mt-2">
          Displayed value is max(0, equity / shares). Raw values: bear {money(rawHeadline(results[0]))}, base {money(rawHeadline(results[1]))}, bull {money(rawHeadline(results[2]))}.
          The weighted raw figure is {money(weightedUnfloored)}. The close on {VALUATION_DATE} was {money(MARKET_PRICE)}.
        </p>
      </details>
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
            <div className="text-xs text-muted">
              Raw {money(rawHeadline(row))}. Close {money(MARKET_PRICE)}.
            </div>
          </button>
        ))}
        <div className="rounded-lg border border-line bg-panel p-3">
          <div className="text-xs uppercase tracking-wide text-muted">Weighted</div>
          <div className="mt-1 font-mono text-xl">{money(weighted)}</div>
          <div className="text-xs text-muted">
            30 / 50 / 20, the reviewers&apos; weights, not a company weight. Bear {money(results[0].assumptions.weight * headlineValue(results[0]))}, base {money(results[1].assumptions.weight * headlineValue(results[1]))}, bull {money(results[2].assumptions.weight * headlineValue(results[2]))}.
          </div>
        </div>
      </div>
      {compact ? (
        <p className="text-sm text-muted">{CASES[name].summary}</p>
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
            <BridgeCard
              title="Note-by-note settlement"
              value={bridge}
              detail={result.convertedNoteIds.length ? `Converted: ${result.convertedNoteIds.join(", ")}` : "No note is in the money at this value."}
            />
            <div className="rounded-lg border border-line p-3 text-sm">
              <div className="font-medium">Dilution panel, not the headline</div>
              <div className="mt-1 font-mono text-lg">{money(result.dilution.perShareIfDiluted)}</div>
              <p className="mt-1 text-xs text-muted">
                If the unfunded slice, {formatCompactUsd(result.dilution.equityCheck)}, were sold at {money(MARKET_PRICE)}, that would be {(result.dilution.sharesIfIssued / 1e6).toFixed(0)} million shares.
                The headline does not issue them. Prepayments in the cash flows are {formatCompactUsd(result.dilution.prepayments)}. Secured draws, refinanced rather than repaid with equity, are {formatCompactUsd(result.dilution.debtDraws)}. Coupon on those draws, not deducted again, is {formatCompactUsd(result.dilution.interestMemo)}.
              </p>
            </div>
          </div>
          <p className="text-sm text-muted">
            Free cash flow is after the 2% stock-based-pay charge, tax at 25.8% on earnings after depreciation, capex, and maintenance.
            Half of growth capex is treated as a prepayment: cash in when spent, then recognized over four years. That split of the 75–85% coverage is not in the filings.
            Opening deferred revenue of {formatCompactUsd(result.deferredDrawn)} is removed as it is recognized. Today&apos;s debt and cash are applied once, at the end.
            {result.terminalMethod === "gordon"
              ? ` Terminal growth earns ${Math.round(result.assumptions.spread * 100)} points of spread over the discount rate.`
              : " Steady-state cash flow does not cover replacement, so the terminal value is zero. No extra debt is subtracted for that choice."}
            {result.tvShareOfEv == null
              ? " Enterprise value is not positive, so terminal value is not shown as a share of it."
              : ` Terminal present value is ${(result.tvShareOfEv * 100).toFixed(0)}% of enterprise value.`}
            {" "}Engine revenue is {formatCompactUsd(result.engineRevenue2026 * 1e6)} in 2026 against a guide of {formatCompactUsd(result.assumptions.revenueGuide2026 * 1e6)}, and {formatCompactUsd(result.engineRevenue2027 * 1e6)} in 2027 against {formatCompactUsd(result.assumptions.revenueGuide2027 * 1e6)}. 2028 is {formatCompactUsd(result.engineRevenue2028 * 1e6)} from the same formula.
            Model payback is {result.paybackMonths.toFixed(0)} months. The letter&apos;s payback is {result.disclosedPaybackMonths} months, and the capex inside that figure is not defined.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr>
                  {["Year", "MW", "Revenue", "EBITDA", "Maintenance", "Growth capex", "FCFF", "PV"].map((heading) => (
                    <th key={heading} className="border-b border-line px-2 py-2 font-medium">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono text-[13px]">
                {result.years.map((row) => (
                  <tr key={row.year} className="border-b border-line/70">
                    <td className="px-2 py-2">{row.label}</td>
                    <td className="px-2 py-2">{row.mw.toLocaleString("en-US")}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.revenue)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.ebitda)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.maintenanceCapex)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.growthCapex)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.fcff)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.pv)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="px-2 py-2" colSpan={6}>Terminal value / present value</td>
                  <td className="px-2 py-2">{formatCompactUsd(result.terminalValue)}</td>
                  <td className="px-2 py-2">{formatCompactUsd(result.pvTerminal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Peer multiples, informational</h3>
            <p className="mb-2 text-sm text-muted">
              Trailing multiples as of November 24, 2026, applied to this case&apos;s 2027 EBITDA, discounted, and paired with September 30 carrying net debt. Informational only.
              At the close, Nebius equity is about {formatCompactUsd(market.equity * 1e6)} and enterprise value about {formatCompactUsd(market.ev * 1e6)}, or {market.evToEbitda == null ? "n/a" : `${market.evToEbitda.toFixed(1)}x`} this case&apos;s 2027 EBITDA.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted">
                  <tr>
                    {["Peer", "As of", "EV/EBITDA", "EV/revenue", "Per share on EBITDA", "Per share on revenue", "Use"].map((heading) => (
                      <th key={heading} className="px-2 py-1 font-medium">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {peers.map((peer) => (
                    <tr key={peer.id} className="border-t border-line/70">
                      <td className="px-2 py-2">
                        <a href={peer.source} className="underline" target="_blank" rel="noreferrer">{peer.ticker}</a>
                        <span className="mt-1 block text-xs text-muted">{peer.name}. {peer.definition}</span>
                      </td>
                      <td className="px-2 py-2">{peer.asOf}</td>
                      <td className="px-2 py-2 font-mono">{peer.evToEbitda ?? "—"}</td>
                      <td className="px-2 py-2 font-mono">{peer.evToRevenue ?? "—"}</td>
                      <td className="px-2 py-2 font-mono">{peer.perShareOnEbitda == null ? "—" : money(peer.perShareOnEbitda)}</td>
                      <td className="px-2 py-2 font-mono">{peer.perShareOnRevenue == null ? "—" : money(peer.perShareOnRevenue)}</td>
                      <td className="px-2 py-2">{peer.applied ? "Shown" : "Not applied"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Cost and price decline, this case</h3>
            <p className="mb-2 text-xs text-muted">
              The same rate cuts server capex on new megawatts, server refresh capex, and the contract rate at the next re-pricing. The published cases use zero.
            </p>
            <table className="mb-6 text-sm">
              <thead className="text-xs text-muted">
                <tr>
                  <th className="px-2 py-1 text-left">Decline</th>
                  <th className="px-2 py-1 text-right">Raw</th>
                  <th className="px-2 py-1 text-right">Shown</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {declines.map((row) => (
                  <tr key={row.decline}>
                    <td className="px-2 py-1">{Math.round(row.decline * 100)}%{row.decline === result.assumptions.costDecline ? " · case" : ""}</td>
                    <td className="px-2 py-1 text-right">{money(row.perShareRaw)}</td>
                    <td className="px-2 py-1 text-right">{money(row.perShare)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 className="mb-2 text-sm font-medium">Base margin against all-in capex per megawatt</h3>
            <p className="mb-2 text-xs text-muted">
              Raw value per share. The November 24 close was {money(MARKET_PRICE)}. The published base is 50% and $37.9 million.
            </p>
            <table className="mb-6 text-sm">
              <thead className="text-xs text-muted">
                <tr>
                  <th className="px-2 py-1 text-left">Margin \ capex</th>
                  {capexGrid[0].map((cell) => (
                    <th key={cell.capex} className="px-2 py-1 text-right">${cell.capex}M</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono">
                {capexGrid.map((row) => (
                  <tr key={row[0].margin}>
                    <td className="px-2 py-1">{Math.round(row[0].margin * 1000) / 10}%</td>
                    {row.map((cell) => (
                      <td key={cell.capex} className="px-2 py-1 text-right">{money(cell.perShareRaw)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 className="mb-2 text-sm font-medium">Base case at other discount rates and terminal growth</h3>
            <table className="text-sm">
              <thead className="text-xs text-muted">
                <tr>
                  <th className="px-2 py-1 text-left">WACC \ g</th>
                  {[2, 3, 4].map((growth) => <th key={growth} className="px-2 py-1 text-right">{growth}%</th>)}
                </tr>
              </thead>
              <tbody className="font-mono">
                {grid.map((row) => (
                  <tr key={row[0].wacc}>
                    <td className="px-2 py-1">{Math.round(row[0].wacc * 100)}%</td>
                    {row.map((cell) => (
                      <td key={cell.growth} className="px-2 py-1 text-right">{cell.perShareRaw == null ? "—" : money(cell.perShareRaw)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

function BridgeCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: { perShare: number; perShareRaw: number; equityFirm: number; netDebt: number; shares: number; convertShares: number; fundingGap: number };
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-line p-3 text-sm">
      <div className="font-medium">{title}</div>
      <div className="mt-1 font-mono text-lg">{money(value.perShare)}</div>
      <p className="mt-1 text-xs text-muted">
        Raw {money(value.perShareRaw)}. Equity {formatCompactUsd(value.equityFirm)} · horizon net debt {formatCompactUsd(value.netDebt)} ·{" "}
        {(value.shares / 1e6).toFixed(1)} million shares
        {value.convertShares ? `, including ${(value.convertShares / 1e6).toFixed(1)} million conversion shares` : ""}. {detail}
      </p>
    </div>
  );
}
