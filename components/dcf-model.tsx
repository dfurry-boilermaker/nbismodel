"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  CASES,
  MODEL_VERSION,
  REFERENCE_CLOSE,
  VALUATION_DATE,
  allCases,
  financingPanel,
  headlineValue,
  marginCapexGrid,
  priceCostGrid,
  rawHeadline,
  runCase,
  sideRuns,
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
  const rawWeighted = useMemo(() => weightedRaw(results), [results]);
  const sides = useMemo(() => sideRuns(), []);
  const [name, setName] = useState<CaseName>("base");
  const result = useMemo(() => runCase(name), [name]);
  const panel = useMemo(() => financingPanel(result), [result]);
  const marginGrid = useMemo(() => marginCapexGrid(), []);
  const rateGrid = useMemo(() => waccGrowthGrid(), []);
  const declineGrid = useMemo(() => priceCostGrid(), []);
  const contributions = results.map((item) => ({ name: item.name, value: item.weight * headlineValue(item) }));
  const bullShare = weighted > 0 ? contributions[2].value / weighted : 0;
  const noBull = (contributions[0].value + contributions[1].value) / (results[0].weight + results[1].weight);
  const maxFlow = Math.max(1, ...result.rows.flatMap((row) => [Math.abs(row.fcff), row.revenue, row.capexNet]));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Model {MODEL_VERSION}, valued from {VALUATION_DATE}. This is educational arithmetic under the stated assumptions. It is not a price target, a forecast, a rating, or a recommendation.
        The headline is unlevered free cash flow on today&apos;s shares. {REFERENCE_CLOSE.label}
      </p>
      <div className="grid gap-3 sm:grid-cols-4">
        {results.map((row) => (
          <button key={row.name} type="button" onClick={() => setName(row.name)} className={`rounded-lg border p-3 text-left ${name === row.name ? "border-accent" : "border-line"}`}>
            <div className="text-xs uppercase tracking-wide text-muted">{row.name} · {Math.round(CASES[row.name].weight * 100)}%</div>
            <div className="mt-1 font-mono text-xl">{money(headlineValue(row))}</div>
            <div className="text-xs text-muted">Raw {money(rawHeadline(row))}. Close {money(REFERENCE_CLOSE.value)} as of {REFERENCE_CLOSE.asOf}.</div>
          </button>
        ))}
        <div className="rounded-lg border border-line bg-panel p-3">
          <div className="text-xs uppercase tracking-wide text-muted">Weighted</div>
          <div className="mt-1 font-mono text-xl">{money(weighted)}</div>
          <div className="text-xs text-muted">{[CASES.bear.weight, CASES.base.weight, CASES.bull.weight].map(w => Math.round(w * 100)).join(" / ")}, the authors&apos; judgment. Raw weighted {money(rawWeighted)}.</div>
        </div>
      </div>
      {compact ? <p className="text-sm text-muted">{result.name}: raw {money(result.bridge.perShareRaw)}, shown {money(result.bridge.perShare)}.</p> : (
        <>
          <section className="rounded-lg border border-line bg-panel p-4 space-y-3">
            <h3 className="font-medium">What drives the weighted value?</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Bull contribution" value={money(contributions[2].value)} />
              <Stat label="Weighted value from bull" value={`${(bullShare * 100).toFixed(1)}%`} />
              <Stat label="Excluding bull, reweighted" value={money(noBull)} />
            </div>
            <div className="flex h-3 overflow-hidden rounded bg-background" role="img" aria-label={contributions.map((item) => `${item.name}: ${money(item.value)}`).join(", ")}>
              {contributions.map((item, index) => <div key={item.name} className={["bg-muted", "bg-sky-500", "bg-accent"][index]} style={{ width: `${weighted > 0 ? item.value / weighted * 100 : 0}%` }} />)}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted">{contributions.map((item) => <span key={item.name}>{item.name}: {money(item.value)} / share</span>)}</div>
            <p className="text-xs text-muted">The contributions use the published subjective weights and floored outcomes. The no-bull illustration redistributes its weight proportionally across the remaining cases; it is not a new forecast.</p>
          </section>
          <div className="flex flex-wrap gap-2">
            {(["bear", "base", "bull"] as const).map((caseName) => (
              <Button key={caseName} type="button" size="sm" variant={name === caseName ? "default" : "outline"} aria-pressed={name === caseName} onClick={() => setName(caseName)}>{caseName}</Button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Enterprise value" value={formatCompactUsd(result.ev * 1e6)} />
            <Stat label="Equity, raw" value={formatCompactUsd(result.bridge.equityValue * 1e6)} />
            <Stat label="Per share, shown" value={money(result.bridge.perShare)} />
          </div>
          <p className="text-sm text-muted">
            Raw {money(result.bridge.perShareRaw)}. If the terminal value is clamped at zero, the raw figure is {money(result.clampedRaw)}.
            Shares {result.bridge.shares.toLocaleString("en-US")}. Notes treated as shares: {result.bridge.converted.join(", ") || "none"}.
            Deal payback {result.payback.deal.toFixed(1)} months, against the disclosed 19 months. The company measure covers opex and capex on a revenue basis; the modeled compute-only payback is not directly comparable.
            Full-year engine revenue is {formatCompactUsd(result.fy2026 * 1e6)} in 2026 and {formatCompactUsd(result.fy2027 * 1e6)} in 2027. 2028 is {formatCompactUsd(result.fy2028 * 1e6)}.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Lower-capacity sensitivity" value={money(sides.guide.raw)} />
            <Stat label="Three-quarter lag" value={money(sides.lag.raw)} />
            <Stat label="Accretion at 0% / 7%" value={`${money(sides.sfc0)} / ${money(sides.sfc7)}`} />
          </div>
          <p className="text-xs text-muted">
            The lower-capacity sensitivity scales the megawatt path by 0.62 from 2027 (${sides.guide.fy27.toFixed(0)} million in 2027, ${sides.guide.fy28.toFixed(0)} million in 2028).
            The three-quarter lag is ${sides.lag.fy27.toFixed(0)} million in 2027. Accretion at 0% and 7% uses the same base inputs. These runs sit beside the headline. They are not used to change the inputs.
            Base energized megawatts in 2031 and 2032 are an estimate, and they are not covered by a disclosed contract.
          </p>
          <div className="rounded-lg border border-line p-3 text-sm">
            <div className="font-medium">Dilution panel, not the headline</div>
            <p className="mt-1 text-xs text-muted">
              Interest over the window {formatCompactUsd(panel.interest * 1e6)}. Notes refinanced {formatCompactUsd(panel.refinanced * 1e6)}.
              New corporate debt {formatCompactUsd(panel.corpTotal * 1e6)}. Equity check {formatCompactUsd(panel.equity * 1e6)}.
              If that equity were sold at the hand-entered close of {money(panel.price)} as of {REFERENCE_CLOSE.asOf}, the illustrative figure is {money(panel.vPost)}. The headline does not use that sale.
            </p>
          </div>
          <section className="space-y-3 rounded-lg border border-line p-4">
            <h3 className="font-medium">Cash-flow trajectory · {name}</h3>
            <p className="text-xs text-muted">USD millions; 2026 is Q4 only. Common scale, zero at the center. Revenue (blue), capex outlay (amber), free cash flow (accent; negative extends left).</p>
            <div className="space-y-2">
              {result.rows.map((row) => <div key={row.year} className="grid grid-cols-[3rem_1fr] items-center gap-2">
                <span className="text-xs font-mono">{row.year}</span>
                <div className="relative space-y-1 border-line">
                  <div className="absolute inset-y-0 left-1/2 border-l border-line" />
                  {[[row.revenue, "bg-sky-500", "Revenue"], [row.capexNet, "bg-amber-500", "Capex"], [row.fcff, "bg-accent", "FCFF"]].map(([value, color, label]) => {
                    const amount = Number(value);
                    const width = Math.abs(amount) / maxFlow * 50;
                    return <div key={String(label)} className="relative h-2" role="img" aria-label={`${row.year} ${label}: ${formatCompactUsd(amount * 1e6)}`} title={`${label}: ${formatCompactUsd(amount * 1e6)}`}><div className={`absolute h-full rounded-sm ${color}`} style={{ left: `${amount < 0 ? 50 - width : 50}%`, width: `${width}%` }} /></div>;
                  })}
                </div>
              </div>)}
            </div>
            <p className="text-xs text-muted">Explicit-period present value {formatCompactUsd(result.pvExplicit * 1e6)} · terminal present value {formatCompactUsd(result.pvTerminal * 1e6)}. A positive terminal value can offset negative earlier cash flows.</p>
          </section>
          <section className="space-y-2">
            <h3 className="font-medium">Annual financing requirements · {name}</h3>
            <p className="text-xs text-muted">Illustrative financing overlay, separate from the headline. Debt amortization is straight-line over five years after each asset-backed draw. All amounts USD.</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase text-muted"><tr>{["Year", "Asset debt draw", "Asset repayment", "Asset debt end", "Corporate draw", "Equity draw", "Notes due", "Cash end"].map((label) => <th key={label} className="border-b border-line px-2 py-2">{label}</th>)}</tr></thead>
                <tbody className="font-mono text-xs">{panel.fundingRows.map((row) => <tr key={row.year} className="border-b border-line/70"><td className="px-2 py-2">{row.year}</td>{[row.abfDraw, row.abfAmort, row.abfEnding, row.corporateDraw, row.equityDraw, row.notePrincipal, row.endingCash].map((value, i) => <td key={i} className="px-2 py-2">{formatCompactUsd(value * 1e6)}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </section>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr>{["Year", "MW", "Revenue", "EBITDA", "Capex", "FCFF", "PV"].map((heading) => <th key={heading} className="border-b border-line px-2 py-2 font-medium">{heading}</th>)}</tr>
              </thead>
              <tbody className="font-mono text-[13px]">
                {result.rows.map((row) => (
                  <tr key={row.year} className="border-b border-line/70">
                    <td className="px-2 py-2">{row.year === 2026 ? "2026 Q4" : row.year}</td>
                    <td className="px-2 py-2">{row.mw.toLocaleString("en-US")}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.revenue * 1e6)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.ebitda * 1e6)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.capexNet * 1e6)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.fcff * 1e6)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(row.pv * 1e6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Grid title="Steady margin against all-in capex per megawatt" note={`A star marks a raw figure at or above the hand-entered close of ${money(REFERENCE_CLOSE.value)} as of ${REFERENCE_CLOSE.asOf}. The marker is display only.`}>
            <table className="text-sm">
              <thead className="text-xs text-muted"><tr><th className="px-2 py-1 text-left">Margin</th>{marginGrid[0].map((cell) => <th key={cell.capex} className="px-2 py-1 text-right">${cell.capex}M</th>)}</tr></thead>
              <tbody className="font-mono">{marginGrid.map((row) => <tr key={row[0].margin}><td className="px-2 py-1">{Math.round(row[0].margin * 100)}%</td>{row.map((cell) => <td key={cell.capex} className="px-2 py-1 text-right">{money(cell.raw)}{cell.raw >= REFERENCE_CLOSE.value ? "*" : ""}</td>)}</tr>)}</tbody>
            </table>
          </Grid>
          <Grid title="Discount rate against terminal growth">
            <table className="text-sm">
              <thead className="text-xs text-muted"><tr><th className="px-2 py-1 text-left">Rate</th>{rateGrid[0].map((cell) => <th key={cell.growth} className="px-2 py-1 text-right">{(cell.growth * 100).toFixed(1)}%</th>)}</tr></thead>
              <tbody className="font-mono">{rateGrid.map((row) => <tr key={row[0].wacc}><td className="px-2 py-1">{(row[0].wacc * 100).toFixed(1)}%</td>{row.map((cell) => <td key={cell.growth} className="px-2 py-1 text-right">{cell.raw == null ? "—" : money(cell.raw)}</td>)}</tr>)}</tbody>
            </table>
          </Grid>
          <Grid title="Price decline against cost decline">
            <table className="text-sm">
              <thead className="text-xs text-muted"><tr><th className="px-2 py-1 text-left">Price</th>{declineGrid[0].map((cell) => <th key={cell.cost} className="px-2 py-1 text-right">{Math.round(cell.cost * 100)}%</th>)}</tr></thead>
              <tbody className="font-mono">{declineGrid.map((row) => <tr key={row[0].price}><td className="px-2 py-1">{Math.round(row[0].price * 100)}%</td>{row.map((cell) => <td key={cell.cost} className="px-2 py-1 text-right">{money(cell.raw)}</td>)}</tr>)}</tbody>
            </table>
          </Grid>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-line bg-panel p-3"><div className="text-xs uppercase tracking-wide text-muted">{label}</div><div className="mt-1 font-mono text-xl">{value}</div></div>;
}

function Grid({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return <div className="min-w-0"><h3 className="mb-2 text-sm font-medium">{title}</h3>{note ? <p className="mb-2 text-xs text-muted">{note}</p> : null}<div className="max-w-full overflow-x-auto" role="region" aria-label={title} tabIndex={0}>{children}</div></div>;
}
