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

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Model {MODEL_VERSION}, discounted from {VALUATION_DATE}. The close that day was {money(MARKET_PRICE)}.
        2026 and 2027 revenue follow the company outlook. Later revenue is energized megawatts times
        utilization times the contract rate. This is educational arithmetic, not a price target.
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
              <div className="font-medium">Against the close</div>
              <div className="mt-1 font-mono text-lg">{money(MARKET_PRICE)}</div>
              <p className="mt-1 text-xs text-muted">
                Raw value {money(bridge.perShareRaw)}. Equity issued {formatCompactUsd(result.equityIssued)} at {money(result.assumptions.issuePrice)}.
                Interest over the explicit years {formatCompactUsd(result.interestTotal)}.
              </p>
            </div>
          </div>
          <p className="text-sm text-muted">
            Cash flow deducts capex, interest on the term loan and on new secured draws, and tax at the Dutch 25.8% rate after depreciation and losses.
            New secured draws fund {Math.round(result.assumptions.coverage * 100)}% of growth capex at the term loan&apos;s 6.4% hedged coupon.
            A cash shortfall is filled by shares at the November 24 close, and those proceeds are the cash that covers the shortfall.
            Opening cash is the starting balance. It is not spent a second time in the bridge.
            Deferred revenue of {formatCompactUsd(result.deferredDrawn)} is removed from cash earnings as it is recognized.
            {result.terminalMethod === "gordon"
              ? " The terminal value reinvests at the discount rate, so growth does not earn a spread."
              : " Steady-state cash flow does not cover replacement, so the terminal value is zero."}
            {result.tvShareOfEv == null
              ? " Equity is negative before the floor, so terminal value is not shown as a share of equity."
              : ` Terminal present value is ${(result.tvShareOfEv * 100).toFixed(0)}% of equity value.`}
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
              Trailing multiples are applied to this case&apos;s 2027 EBITDA and discounted back, using this case&apos;s 2027 net debt.
              The CoreWeave GAAP multiple is not applied to Nebius adjusted EBITDA. At the November 24 close, Nebius equity is about {formatCompactUsd(market.equity * 1e6)} and enterprise value about {formatCompactUsd(market.ev * 1e6)}, or {market.evToEbitda == null ? "n/a" : `${market.evToEbitda.toFixed(1)}x`} this case&apos;s 2027 EBITDA.
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
