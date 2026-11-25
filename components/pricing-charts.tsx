"use client";

import { useState } from "react";

export type HistoryPoint = { date: string; value: number | null };
export type HistorySeries = { id: string; label: string; points: HistoryPoint[] };
const number = (v: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(v);

export function HistoryChart({ title, series, unit, note, money = false }: { title: string; series: HistorySeries[]; unit: string; note?: string; money?: boolean }) {
  const [selected, setSelected] = useState(series[0]?.id ?? "");
  const [range, setRange] = useState("90");
  const active = series.find(s => s.id === selected) ?? series[0];
  const sorted = [...(active?.points ?? [])].sort((a,b) => a.date.localeCompare(b.date));
  const end = sorted.length ? Date.parse(sorted[sorted.length-1].date) : 0;
  const points = sorted.filter(p => range === "all" || Date.parse(p.date) >= end - Number(range)*86400000);
  const observed = points.filter((p): p is {date:string;value:number} => p.value !== null && Number.isFinite(p.value));
  const last = observed.at(-1);
  const first = observed[0];
  const maximum = Math.max(1e-12, ...observed.map(p => p.value));
  const start = points.length ? Date.parse(points[0].date) : 0;
  const span = Math.max(1, end-start);
  const x = (d:string) => 48 + (Date.parse(d)-start)/span*260;
  const y = (v:number) => 106-v/maximum*94;
  const fmt = (v:number) => (money ? "$" : "")+number(v);
  const change = first && last && observed.length > 1 && first.value !== 0 ? (last.value/first.value-1)*100 : null;
  const [hover, setHover] = useState<string | null>(null);
  const focused = observed.find(p => p.date === hover) ?? last;
  return <section className="min-w-0 border border-line bg-panel p-4 space-y-3">
    <div><h3 className="text-lg font-medium">{title}</h3><p className="text-xs text-muted">{unit}</p></div>
    {series.length > 0 && <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
      <label className="min-w-0 text-xs text-muted">Series<select className="mt-1 block w-full min-w-0 border border-line bg-background p-2 text-sm text-foreground" value={active?.id ?? ""} onChange={e=>{setSelected(e.target.value);setHover(null)}}>{series.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
      <label className="text-xs text-muted">Window<select className="mt-1 block w-full border border-line bg-background p-2 text-sm text-foreground" value={range} onChange={e=>{setRange(e.target.value);setHover(null)}}><option value="30">30 days</option><option value="90">90 days</option><option value="all">All history</option></select></label>
    </div>}
    {last ? <>
      <div className="flex flex-wrap items-baseline justify-between gap-2"><div><div className="font-mono text-2xl text-foreground">{fmt(last.value)}</div><p className="text-xs text-muted">Latest observed · {last.date.slice(0,10)}</p></div><div className="text-xs text-muted">{change === null ? "No change calculated" : `${change>0?"+":""}${change.toFixed(1)}% in window`}</div></div>
      {observed.length > 1 ? <>
        <svg viewBox="0 0 320 118" className="block w-full" role="img" aria-label={`${active?.label}: ${observed.length} observations; latest ${fmt(last.value)}`}>
          {[0,.5,1].map(f=><g key={f}><line x1="48" x2="308" y1={y(maximum*f)} y2={y(maximum*f)} stroke="var(--line)" strokeWidth=".7"/><text x="43" y={y(maximum*f)+3} textAnchor="end" fontSize="8" fill="var(--muted)">{new Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:2}).format(maximum*f)}</text></g>)}
          {points.map((p,i)=>{const previous=points[i-1];return previous && previous.value!==null && p.value!==null ? <line key={p.date} x1={x(previous.date)} y1={y(previous.value)} x2={x(p.date)} y2={y(p.value)} stroke="var(--cyan)" strokeWidth="1.8"/> : null})}
          {observed.map(p=><circle key={p.date} cx={x(p.date)} cy={y(p.value)} r={focused?.date===p.date?3:1.6} fill="var(--cyan)"/>)}
        </svg>
        <div className="flex justify-between gap-2 font-mono text-[10px] text-muted"><span>{points[0]?.date.slice(0,10)}</span><span>{points.at(-1)?.date.slice(0,10)}</span></div>
        <label className="block text-xs text-muted">Inspect observation<select className="mt-1 block w-full border border-line bg-background p-2 text-sm text-foreground" value={focused?.date ?? ""} onChange={e=>setHover(e.target.value)}>{observed.map(p=><option key={p.date} value={p.date}>{p.date.slice(0,10)} · {fmt(p.value)}</option>)}</select></label>
      </> : <p className="border-t border-line pt-3 text-sm text-muted">One recorded observation in this window. No historical trend yet.</p>}
      <p className="text-xs text-muted">{observed.length} observed points · {points.length-observed.length} missing</p>
    </> : <p className="border-t border-line pt-3 text-sm text-muted">No observations available. Missing values are not treated as zero.</p>}
    {note && <p className="text-xs leading-relaxed text-muted">{note}</p>}
  </section>;
}

export function PriceBars({title, rows, unit, note, money=true}: {title:string; rows:{label:string;value:number}[];unit:string;note?:string;money?:boolean}) {
  const max=Math.max(1e-12,...rows.map(r=>r.value));
  return <section className="min-w-0 border border-line bg-panel p-4 space-y-3"><div><h3 className="text-lg font-medium">{title}</h3><p className="text-xs text-muted">{unit}</p></div>
    {rows.length ? rows.map((r,i)=><div key={r.label+"-"+i} className="space-y-1"><div className="flex justify-between items-baseline gap-3 text-xs"><span className="min-w-0 break-words">{r.label}</span><span className="shrink-0 font-mono">{money?"$":""}{number(r.value)}</span></div><div className="h-2 bg-background"><div className="h-full" style={{width:`${r.value/max*100}%`,background:"var(--cyan)"}}/></div></div>) : <p className="text-sm text-muted">No observed values.</p>}
    {note && <p className="text-xs leading-relaxed text-muted">{note}</p>}
  </section>;
}
