"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COMPANY_CASE, preset, runDcf, type DcfInput } from "@/lib/dcf";
import { formatCompactUsd } from "@/lib/utils";

const FIELDS: { key: keyof DcfInput; label: string; step: string; hint: string; sourced: boolean }[] = [
  { key: "revenue2026", label: "2026 revenue, $ millions", step: "50", hint: "Company case uses $3,000 million, the low end of the $3.0–3.4 billion range after the November 12, 2026 update.", sourced: true },
  { key: "revenue2027", label: "2027 revenue, $ millions", step: "100", hint: "Company case uses $12,500 million, the midpoint of the $12–13 billion initial outlook. The midpoint is arithmetic, not a company point estimate.", sourced: true },
  { key: "margin2026", label: "2026 EBITDA margin", step: "0.01", hint: "Company guided about 40% adjusted EBITDA margin for 2026.", sourced: true },
  { key: "margin2027", label: "2027 EBITDA margin", step: "0.01", hint: "Not guided. Company case holds the 2026 margin flat. That is an assumption.", sourced: false },
  { key: "marginLater", label: "2028–2030 and terminal margin", step: "0.01", hint: "Assumption. The May 2025 letter once described medium-term adjusted EBIT margins of 20–30%. This field is EBITDA, and it is not that statement.", sourced: false },
  { key: "capex2026", label: "2026 capex, $ millions", step: "500", hint: "About $27 billion, the November 12, 2026 update.", sourced: true },
  { key: "capex2027", label: "2027 capex, $ millions", step: "500", hint: "Company case uses $42,500 million, the midpoint of $40–45 billion.", sourced: true },
  { key: "capexPercentAfter", label: "Capex as % of revenue after 2027", step: "0.05", hint: "Assumption. No capex was guided past 2027.", sourced: false },
  { key: "growthAfter", label: "Revenue growth, 2028–2030", step: "0.05", hint: "Assumption. Applied to 2027 revenue.", sourced: false },
  { key: "wacc", label: "WACC", step: "0.005", hint: "Assumption. Not a company figure.", sourced: false },
  { key: "terminalGrowth", label: "Terminal growth", step: "0.005", hint: "Assumption. Applied after 2030.", sourced: false },
  { key: "taxRate", label: "Tax rate on positive EBITDA", step: "0.01", hint: "Default 0. No tax rate was guided. Depreciation is not forecast, so tax is applied to EBITDA, which overstates tax if you set a rate.", sourced: false },
  { key: "cashMillions", label: "Cash, $ millions", step: "1", hint: "Cash and cash equivalents, September 30, 2026, $7,425.6 million.", sourced: true },
  { key: "debtMillions", label: "Debt, $ millions", step: "1", hint: "Current $187.5 million plus non-current $14,003.3 million.", sourced: true },
  { key: "shares", label: "Basic shares", step: "1000", hint: "292,902,405 shares outstanding on September 30, 2026. Not diluted for convertibles, SAFEs, or options.", sourced: true },
];

export function DcfModel({ compact = false }: { compact?: boolean }) {
  const [input, setInput] = useState<DcfInput>(COMPANY_CASE);
  const result = useMemo(() => runDcf(input), [input]);
  const sensitivity = useMemo(() => {
    if (!result.ok) return [];
    return [0.08, 0.1, 0.12].map((wacc) =>
      [0.02, 0.03, 0.04].map((terminalGrowth) => {
        const run = runDcf({ ...input, wacc, terminalGrowth });
        return run.ok ? run.perShare : null;
      }),
    );
  }, [input, result]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => setInput(preset("company"))}>
          Company case
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setInput(preset("bear"))}>
          Bear
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setInput(preset("bull"))}>
          Bull
        </Button>
      </div>
      <p className="text-sm text-muted">
        Bear keeps 2026 revenue at the guided low end and uses the low end of the 2027 revenue
        range, a 25% later margin, and the high end of 2027 capex. Bull uses the top of the
        published 2026 range ($3.4 billion), which is no longer what the company says it expects,
        the top of the 2027 revenue range, and the low end of 2027 capex. Yellow fields are
        assumptions.
      </p>
      {!compact ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <label key={field.key} className="block text-sm">
              <span className="mb-1 flex items-center gap-2">
                {field.label}
                <Badge tone={field.sourced ? "good" : "amber"}>{field.sourced ? "Sourced" : "Assumption"}</Badge>
              </span>
              <Input
                type="number"
                step={field.step}
                value={input[field.key]}
                onChange={(event) =>
                  setInput({ ...input, [field.key]: Number(event.target.value) })
                }
              />
              <span className="mt-1 block text-xs text-muted">{field.hint}</span>
            </label>
          ))}
        </div>
      ) : null}
      {!result.ok ? (
        <p className="rounded-md border border-bad/40 bg-bad/10 p-3 text-sm">{result.reason}</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Enterprise value" value={formatCompactUsd(result.enterpriseValue)} />
            <Stat label="Equity value" value={formatCompactUsd(result.equityValue)} />
            <Stat label="Per basic share" value={formatCompactUsd(result.perShare)} />
          </div>
          <p className="text-sm text-muted">
            Net debt used is {formatCompactUsd(result.netDebt)} (debt minus cash). Cash flows are
            placed at each December 31 and discounted from {input.asOf} with year fractions of
            actual days over 365. FCFF = EBITDA − tax − capex. Terminal value = next year&apos;s
            FCFF / (WACC − growth), discounted from December 31, 2030. 2026 and 2027 capex in the
            company case is larger than EBITDA, so near-term FCFF is negative. A positive
            per-share figure, when there is one, is mostly terminal value. This is the arithmetic
            of the inputs, not a price target.
          </p>
          {!compact ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted">
                  <tr>
                    {["Year", "Revenue", "EBITDA", "Tax", "Capex", "FCFF", "Years out", "PV"].map((h) => (
                      <th key={h} className="border-b border-line px-2 py-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono text-[13px]">
                  {result.years.map((row) => (
                    <tr key={row.year} className="border-b border-line/70">
                      <td className="px-2 py-2">{row.year}</td>
                      <td className="px-2 py-2">{formatCompactUsd(row.revenue)}</td>
                      <td className="px-2 py-2">{formatCompactUsd(row.ebitda)}</td>
                      <td className="px-2 py-2">{formatCompactUsd(row.tax)}</td>
                      <td className="px-2 py-2">{formatCompactUsd(row.capex)}</td>
                      <td className="px-2 py-2">{formatCompactUsd(row.fcff)}</td>
                      <td className="px-2 py-2">{row.yearsOut.toFixed(2)}</td>
                      <td className="px-2 py-2">{formatCompactUsd(row.pv)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-2 py-2" colSpan={5}>Terminal FCFF / terminal value / PV of terminal</td>
                    <td className="px-2 py-2">{formatCompactUsd(result.terminalFcff)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(result.terminalValue)}</td>
                    <td className="px-2 py-2">{formatCompactUsd(result.pvTerminal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : null}
          {!compact ? (
            <div>
              <h3 className="mb-2 text-sm font-medium">Per share at other WACC and terminal growth</h3>
              <table className="text-sm">
                <thead className="text-xs text-muted">
                  <tr>
                    <th className="px-2 py-1 text-left">WACC \ g</th>
                    {[0.02, 0.03, 0.04].map((g) => (
                      <th key={g} className="px-2 py-1 text-right">{(g * 100).toFixed(0)}%</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {sensitivity.map((row, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1">{[8, 10, 12][i]}%</td>
                      {row.map((cell, j) => (
                        <td key={j} className="px-2 py-1 text-right">
                          {cell == null ? "—" : formatCompactUsd(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
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
