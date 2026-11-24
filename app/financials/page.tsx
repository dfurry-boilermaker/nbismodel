import { FinancialCharts } from "@/components/result-charts";
import { MetricValue, SourceA } from "@/components/metric-value";
import { financials } from "@/lib/load";
import type { Metric } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Financials — Nebius model" };

const COLUMNS: { key: "revenue" | "adjustedEbitda" | "netIncome" | "capex" | "cash"; label: string }[] = [
  { key: "revenue", label: "Revenue" },
  { key: "adjustedEbitda", label: "Adj. EBITDA" },
  { key: "netIncome", label: "Net income" },
  { key: "capex", label: "Capex" },
  { key: "cash", label: "Cash" },
];

export default function FinancialsPage() {
  const sources = financials.sources;
  return (
    <div className="space-y-8">
      <header>
        <div className="eyebrow">/ 01 / Reported results</div>
        <h1 className="text-3xl font-semibold text-accent">Reported financials</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          {financials.forms} Figures are USD millions. Capex from the cash-flow line
          &quot;purchases of property and equipment and intangible assets&quot; is shown as an
          outflow. Every figure links to the document it was taken from. Where a later release
          recast the quarter, the later figure is shown and the first-reported figure sits under it.
        </p>
        <p className="mt-2 text-sm">
          <SourceA source="ir" sources={sources}>All releases on nebius.com/financials</SourceA>
          {" · "}
          <SourceA source="edgar" sources={sources}>EDGAR, CIK {financials.cik}</SourceA>
        </p>
      </header>

      <FinancialCharts />

      <div className="hidden overflow-x-auto rounded-xl border border-line md:block">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Quarter</th>
              {COLUMNS.map((column) => (
                <th key={column.key} className="px-3 py-2 font-medium">{column.label}</th>
              ))}
              <th className="px-3 py-2 font-medium">Debt</th>
              <th className="px-3 py-2 font-medium">ARR</th>
            </tr>
          </thead>
          <tbody>
            {financials.quarters.map((quarter) => (
              <tr key={quarter.id} className="border-t border-line align-top">
                <td className="px-3 py-3">
                  <div className="font-medium">{quarter.label}</div>
                  <div className="whitespace-nowrap text-xs text-muted">Ended {quarter.periodEnd}</div>
                </td>
                {COLUMNS.map((column) => (
                  <td key={column.key} className="px-3 py-3 font-mono text-[13px]">
                    <MetricValue metric={quarter[column.key]} sources={sources} />
                  </td>
                ))}
                <td className="px-3 py-3 font-mono text-[13px]">
                  <Debt quarterDebt={quarter.debtCurrent} quarterLong={quarter.debtNonCurrent} sources={sources} />
                </td>
                <td className="px-3 py-3 font-mono text-[13px]">
                  <MetricValue metric={quarter.arr} sources={sources} digits={0} />
                  {quarter.arr?.note ? (
                    <span className="mt-0.5 block font-sans text-[11px] text-muted">Floor, not an exact ARR.</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {financials.quarters.map((quarter) => (
          <article key={quarter.id} className="rounded-xl border border-line bg-panel p-3">
            <h2 className="font-medium">{quarter.label}</h2>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
              {COLUMNS.map((column) => (
                <div key={column.key}>
                  <dt className="text-xs text-muted">{column.label}</dt>
                  <dd className="font-mono"><MetricValue metric={quarter[column.key]} sources={sources} /></dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Quarter notes, segments, and other disclosed lines</h2>
        {financials.quarters.map((quarter) => (
          <article key={quarter.id} className="rounded-lg border border-line p-3 text-sm">
            <h3 className="font-medium">{quarter.label}</h3>
            {quarter.scopeNote ? <p className="mt-1 text-muted">{quarter.scopeNote}</p> : null}
            <ul className="mt-2 space-y-1">
              {quarter.segmentRevenue.map((row) => (
                <li key={row.name}>
                  {row.name}: <MetricValue metric={row.metric} sources={sources} />
                  {row.metric.note ? <span className="text-muted"> — {row.metric.note}</span> : null}
                </li>
              ))}
              {quarter.other.map((row) => (
                <li key={row.label}>
                  {row.label}: <MetricValue metric={row.metric} sources={sources} />
                  {row.metric.basis ? <span className="text-muted"> — {row.metric.basis}</span> : null}
                  {row.metric.note ? <span className="text-muted"> {row.metric.note}</span> : null}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-medium">{financials.annual.label}</h2>
        <p className="mt-1 text-sm text-muted">
          <SourceA source={financials.annual.source} sources={sources}>
            {sources[financials.annual.source]?.title}
          </SourceA>
          . Blank cells were not a clean number in that filing.
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-panel text-xs uppercase tracking-wide text-muted">
              <tr>
                {["Line", "2023", "2024", "2025"].map((heading) => (
                  <th key={heading} className="px-3 py-2 font-medium">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {financials.annual.rows.map((row) => (
                <tr key={row.line} className="border-t border-line">
                  <td className="px-3 py-2">
                    {row.line}
                    {row.note ? <span className="mt-1 block text-xs text-muted">{row.note}</span> : null}
                  </td>
                  {(["y2023", "y2024", "y2025"] as const).map((year) => (
                    <td key={year} className="px-3 py-2 font-mono">
                      {row[year] == null ? (
                        <span className="text-amber">—</span>
                      ) : (
                        <SourceA source={financials.annual.source} sources={sources}>
                          {formatNumber(row[year] as number, 1)}
                        </SourceA>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Debt({
  quarterDebt,
  quarterLong,
  sources,
}: {
  quarterDebt: Metric | null;
  quarterLong: Metric | null;
  sources: typeof financials.sources;
}) {
  return (
    <div>
      <div>Current <MetricValue metric={quarterDebt} sources={sources} /></div>
      <div>Long <MetricValue metric={quarterLong} sources={sources} /></div>
    </div>
  );
}
