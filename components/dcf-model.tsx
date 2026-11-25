"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CASES,
  MODEL_VERSION,
  VALUATION_DATE,
  allCases,
  headlineValue,
  marginMaintenanceGrid,
  peerCrossCheck,
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
  const peers = useMemo(() => peerCrossCheck(result), [result]);
  const grid = useMemo(() => waccGrowthGrid(), []);
  const marginGrid = useMemo(() => marginMaintenanceGrid(), []);
  const flagged = peers.some((peer) => peer.divergesFromDcf);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Model {MODEL_VERSION}, discounted from {VALUATION_DATE}. Guided revenue and capex are used for
        2026 and 2027. Later revenue is the energized fleet times a labeled revenue-per-megawatt rate.
        After the build, capex is maintenance only. This is not a price target or a recommendation.
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
          <div className="text-xs text-muted">
            25 / 50 / 25. Bear {money(results[0].assumptions.weight * headlineValue(results[0]))}, base {money(results[1].assumptions.weight * headlineValue(results[1]))}, bull {money(results[2].assumptions.weight * headlineValue(results[2]))}.
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
            <BridgeCard title="Notes outstanding" value={result.bridges.none} />
            <BridgeCard title="All notes share-settled" value={result.bridges.all} />
          </div>
          <p className="text-sm text-muted">
            Free cash flow is after-tax EBIT minus growth capex. Depreciation equals maintenance
            capex: servers and network gear over the disclosed five-year life, and the other 15%
            of the 2026–27 budget over 15 years, which is an assumption. New capex starts
            depreciating the next year. Tax is {Math.round(result.assumptions.taxRate * 100)}% in
            this case, a normalized rate after losses. Nebius has not guided a cash tax rate.
            The terminal method is {result.terminalMethod === "gordon"
              ? "Gordon growth on maintenance-only free cash flow."
              : "a five-year harvest with no replacement capex, because maintenance exceeds EBITDA. Replacing assets forever at a loss is not assumed."}
            {" "}Equity value is enterprise value minus opening carrying debt plus the unrestricted
            cash still left after the funding gap. Future borrowings are not subtracted again.
            Residual equity of {formatCompactUsd(bridge.fundingGap)} is issued at ${result.assumptions.issuePrice.toFixed(2)}.
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
            <h3 className="mb-2 text-sm font-medium">Peer multiples on this case&apos;s 2027 figures</h3>
            {flagged ? (
              <p className="mb-2 text-sm text-amber">
                At least one multiple implies a per-share figure more than 50% away from this
                case&apos;s discounted cash flow. The cash-flow result deducts growth capex. A
                multiple on next year&apos;s EBITDA does not.
              </p>
            ) : null}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted">
                  <tr>
                    {["Peer", "As of", "EV/EBITDA", "EV/revenue", "Per share on EBITDA", "Per share on revenue", "Vs DCF"].map((heading) => (
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
                      <td className="px-2 py-2">{peer.divergesFromDcf ? <Badge tone="amber">Over 50%</Badge> : <Badge tone="good">Within 50%</Badge>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
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
                      <td key={cell.growth} className="px-2 py-1 text-right">{cell.perShare == null ? "—" : money(cell.perShare)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Base terminal margin against maintenance as a share of revenue</h3>
            <p className="mb-2 text-xs text-muted">
              The explicit years stay at the base case. Only the terminal value is rebuilt. The
              model&apos;s own maintenance cost is about 29% of 2032 revenue.
            </p>
            <table className="text-sm">
              <thead className="text-xs text-muted">
                <tr>
                  <th className="px-2 py-1 text-left">Margin \ maintenance</th>
                  {marginGrid[0].map((cell) => (
                    <th key={cell.maintenanceToRevenue} className="px-2 py-1 text-right">{Math.round(cell.maintenanceToRevenue * 100)}%</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono">
                {marginGrid.map((row) => (
                  <tr key={row[0].margin}>
                    <td className="px-2 py-1">{Math.round(row[0].margin * 100)}%</td>
                    {row.map((cell) => (
                      <td key={cell.maintenanceToRevenue} className="px-2 py-1 text-right">{money(cell.perShare)}</td>
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
}: {
  title: string;
  value: { perShare: number; equityFirm: number; netDebt: number; shares: number; convertShares: number; fundingGap: number };
}) {
  return (
    <div className="rounded-lg border border-line p-3 text-sm">
      <div className="font-medium">{title}</div>
      <div className="mt-1 font-mono text-lg">{money(value.perShare)}</div>
      <p className="mt-1 text-xs text-muted">
        Equity {formatCompactUsd(value.equityFirm)} · net debt {formatCompactUsd(value.netDebt)} ·{" "}
        {(value.shares / 1e6).toFixed(1)} million shares
        {value.convertShares ? `, including ${(value.convertShares / 1e6).toFixed(1)} million conversion shares` : ""}.
      </p>
    </div>
  );
}
