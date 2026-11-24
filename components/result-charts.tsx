import { financials } from "@/lib/load";
import type { GuidanceItem } from "@/lib/types";
import { latestRevision } from "@/lib/guidance";

export function FinancialCharts() {
  const quarters = [...financials.quarters].sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
  return <section aria-label="Quarterly financial trends" className="grid gap-4 lg:grid-cols-3">
    {(["revenue", "adjustedEbitda", "capex"] as const).map(key => {
      const values = quarters.map(q => q[key].value ?? 0);
      const min = Math.min(0, ...values);
      const span = Math.max(0, ...values) - min || 1;
      const zero = -min / span * 100;
      const title = { revenue: "Revenue", adjustedEbitda: "Adjusted EBITDA", capex: "Capital expenditure" }[key];
      return <figure key={key} className="rounded-xl border border-line bg-panel p-4">
        <figcaption className="mb-4"><h2 className="text-xl">{title}</h2><span className="text-xs text-muted">Quarterly · USD millions</span></figcaption>
        {quarters.map(q => {
          const metric = q[key];
          const v = metric.value;
          return <div key={q.id} className="grid grid-cols-[4.5rem_1fr_4.5rem] items-center gap-2 py-1 text-xs">
            <span>{q.label}</span>
            <div aria-hidden="true" className="relative h-4 border-b border-line">
              <i className="absolute h-full border-l border-muted" style={{left: zero + "%"}} />
              {v != null && <i className="absolute top-1 h-2 rounded-sm" style={{left: (Math.min(0, v) - min) / span * 100 + "%", width: Math.abs(v) / span * 100 + "%", background: v < 0 ? "var(--violet)" : "var(--good)"}} />}
            </div>
            <a className="text-right font-mono underline" href={financials.sources[metric.source]?.url} title={metric.basis}>{v?.toLocaleString("en-US") ?? "—"}</a>
          </div>;
        })}
      </figure>;
    })}
  </section>;
}

export function GuidanceChart({ item }: { item: GuidanceItem }) {
  const rev = latestRevision(item);
  const actual = item.actual;
  if (rev.change === "replaced" || rev.low == null || !actual || actual.value == null) return null;
  const ceiling = Math.max(rev.low, rev.high ?? 0, actual.value) * 1.12;
  if (ceiling <= 0 || actual.value < 0 || rev.low < 0) return null;
  const percent = (value: number) => value / ceiling * 100 + "%";
  return <figure className="my-4 max-w-2xl rounded border border-line bg-background p-3">
    <figcaption className="flex flex-wrap justify-between gap-2 text-xs">
      <span className="text-good">Reported · {actual.approximate ? "≈ " : ""}{actual.value.toLocaleString("en-US")} {item.unit}</span>
      <span className="text-amber">Target · {rev.label}</span>
    </figcaption>
    <div aria-hidden="true" className="relative mt-3 h-5 border-b border-line">
      <div className="absolute bottom-1 h-2 bg-good" style={{left: 0, width: percent(actual.value)}} />
      <div className="absolute inset-y-0 border-x-2 border-amber bg-amber/30" style={{left: percent(rev.low), width: percent((rev.high ?? rev.low) - rev.low)}} />
    </div>
    <p className="mt-1 text-xs text-muted">0 {item.unit} · Reported {actual.asOf}{rev.periodEnd ? " · Target period ends " + rev.periodEnd : ""}</p>
  </figure>;
}
