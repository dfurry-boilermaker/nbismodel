"use client";

import { useState } from "react";

export type HistoryPoint = { date: string; value: number | null };
export type HistorySeries = { id: string; label: string; points: HistoryPoint[] };
type ObservedPoint = {date:string;value:number};
const number = (v: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(v);
const compact = (v:number) => new Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:2}).format(v);
const isObserved = (p:HistoryPoint):p is ObservedPoint => p.value !== null && Number.isFinite(p.value) && p.value >= 0;
const day = (d:string) => Date.parse(d.slice(0,10)+"T00:00:00Z");
const DAY = 86400000;
const shortDate = (d:number) => new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",timeZone:"UTC"}).format(d);

export function HistoryChart({ title, series, unit, note, money = false, kind = "line", compare = false }: { title: string; series: HistorySeries[]; unit: string; note?: string; money?: boolean; kind?: "line" | "bar"; compare?: boolean }) {
  const [selected, setSelected] = useState(series[0]?.id ?? "");
  const [comparison, setComparison] = useState("");
  const [range, setRange] = useState("90");
  const [focus, setFocus] = useState<string | null>(null);
  const active = series.find(s => s.id === selected) ?? series[0];
  const other = compare && kind === "line" && comparison !== active?.id ? series.find(s=>s.id===comparison) : undefined;
  const selectedSeries = [active,other].filter((s):s is HistorySeries=>s!==undefined);
  const dates = [...new Set(selectedSeries.flatMap(s=>s.points.map(p=>p.date.slice(0,10))))].sort();
  const end = dates.length ? day(dates[dates.length-1]) : 0;
  const windowDates = dates.filter(d=>range==="all" || day(d)>=end-(Number(range)-1)*DAY);
  const start = windowDates.length ? day(windowDates[0]) : end;
  const span = Math.max(DAY,end-start);
  const plotted = selectedSeries.map(s=>{
    const byDay=new Map(s.points.map(p=>[p.date.slice(0,10),p.value]));
    return { ...s, points:windowDates.map(date=>({date,value:byDay.get(date)??null})) };
  });
  const observed = (plotted[0]?.points??[]).filter(isObserved);
  const last = observed.at(-1);
  const first = observed[0];
  const focused = observed.find(p=>p.date===focus)??last;
  const allObserved = plotted.flatMap(s=>s.points.filter(isObserved));
  const peak = Math.max(0,...allObserved.map(p=>p.value));
  const maximum = peak>0 ? peak*1.1 : 1;
  const fmt = (v:number)=>(money?"$":"")+number(v);
  const change = first && last && observed.length>1 && first.value!==0 ? (last.value/first.value-1)*100 : null;
  const total = observed.reduce((sum,p)=>sum+p.value,0);
  const left=54,right=348,top=14,bottom=156,width=right-left;
  const count = Math.max(1,Math.round((end-start)/DAY)+1);
  const slot=width/count;
  const barWidth=Math.max(.25,Math.min(28,slot*.76));
  const x = (d:string)=>kind==="bar"?left+(Math.round((day(d)-start)/DAY)+.5)*slot:start===end?(left+right)/2:left+(day(d)-start)/span*width;
  const y = (v:number)=>bottom-v/maximum*(bottom-top);
  const colors=["var(--cyan)","var(--amber)"];
  const ticks = start===end?[start]:[start,...(end-start>=6*DAY?[start+Math.round((end-start)/(2*DAY))*DAY]:[]),end];
  return <section className="min-w-0 border border-line bg-panel p-4 space-y-3">
    <div><p className="text-[10px] uppercase tracking-wider text-muted">{kind==="bar"?"Daily volume · bars":"Historical trend · line"}</p><h3 className="text-lg font-medium">{title}</h3><p className="text-xs text-muted">{unit}</p></div>
    {series.length>0 && <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
      <label className="min-w-0 text-xs text-muted">Series<select className="mt-1 block w-full min-w-0 border border-line bg-background p-2 text-sm text-foreground" value={active?.id??""} onChange={e=>{setSelected(e.target.value);if(e.target.value===comparison)setComparison("");setFocus(null)}}>{series.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
      <label className="text-xs text-muted">Window<select className="mt-1 block w-full border border-line bg-background p-2 text-sm text-foreground" value={range} onChange={e=>{setRange(e.target.value);setFocus(null)}}><option value="30">30 days</option><option value="90">90 days</option><option value="all">All history</option></select></label>
      {compare && kind==="line" && <label className="min-w-0 text-xs text-muted sm:col-span-2">Compare with<select className="mt-1 block w-full min-w-0 border border-line bg-background p-2 text-sm text-foreground" value={other?.id??""} onChange={e=>setComparison(e.target.value)}><option value="">No comparison</option>{series.filter(s=>s.id!==active?.id).map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label>}
    </div>}
    {allObserved.length>0 ? <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div><p className="text-xs text-muted">Latest observed</p><p className="font-mono text-lg">{last?fmt(last.value):"—"}</p><p className="text-[10px] text-muted">{last?.date??"No observation"}</p></div>
        {kind==="bar"?<><div><p className="text-xs text-muted">Observed total</p><p className="font-mono text-lg">{observed.length?compact(total):"—"}</p></div><div><p className="text-xs text-muted">Average observed day</p><p className="font-mono text-lg">{observed.length?compact(total/observed.length):"—"}</p></div></>:<div><p className="text-xs text-muted">Change in window</p><p className="font-mono text-lg">{change===null?"—":(change>0?"+":"")+change.toFixed(1)+"%"}</p></div>}
      </div>
      <svg viewBox="0 0 360 190" className="block w-full" role="img" aria-label={title+"; "+selectedSeries.map(s=>s.label).join(" compared with ")}>
        {[0,.25,.5,.75,1].map(f=><g key={f}><line x1={left} x2={right} y1={y(maximum*f)} y2={y(maximum*f)} stroke="var(--line)" strokeWidth=".7"/><text x={left-6} y={y(maximum*f)+3} textAnchor="end" fontSize="9" fill="var(--muted)">{money?"$":""}{compact(maximum*f)}</text></g>)}
        {ticks.map((t,i)=><text key={t} x={start===end?(left+right)/2:left+(t-start)/span*width} y={bottom+17} textAnchor={ticks.length===1?"middle":i===0?"start":i===ticks.length-1?"end":"middle"} fontSize="9" fill="var(--muted)">{shortDate(t)}</text>)}
        {kind==="bar" ? observed.map(p=><rect key={p.date} x={x(p.date)-barWidth/2} y={y(p.value)} width={barWidth} height={bottom-y(p.value)} rx=".6" fill={focused?.date===p.date?"var(--good)":"var(--cyan)"}><title>{p.date}: {fmt(p.value)} {unit}</title></rect>) : plotted.map((s,index)=><g key={s.id}>
          {s.points.map((p,i)=>{const prior=s.points[i-1];return prior && isObserved(prior) && isObserved(p) ? <line key={p.date} x1={x(prior.date)} y1={y(prior.value)} x2={x(p.date)} y2={y(p.value)} stroke={colors[index]} strokeWidth="2" strokeLinecap="round"/>:null})}
          {s.points.filter(isObserved).map(p=><circle key={p.date} cx={x(p.date)} cy={y(p.value)} r={p.date===focused?.date?3.5:2} fill={colors[index]}><title>{s.label} · {p.date}: {fmt(p.value)}</title></circle>)}
        </g>)}
      </svg>
      {kind==="line" && <div className="flex flex-wrap gap-3 text-xs">{plotted.map((s,i)=><span key={s.id} className="flex items-center gap-1.5"><i className="h-0.5 w-4" style={{background:colors[i]}}/>{s.label}</span>)}</div>}
      {kind==="line" && plotted.every(s=>s.points.filter(isObserved).length<=1) && <p className="text-xs text-muted">Single observations are shown as dots; no historical line is inferred.</p>}
      {observed.length>0 && <label className="block text-xs text-muted">Inspect observation<select className="mt-1 block w-full border border-line bg-background p-2 text-sm text-foreground" value={focused?.date??""} onChange={e=>setFocus(e.target.value)}>{observed.map(p=><option key={p.date} value={p.date}>{p.date} · {fmt(p.value)}</option>)}</select></label>}
      <p className="text-xs text-muted">{observed.length} observed {kind==="bar"?"days":"points"} · {Math.max(0,(kind==="bar"?count:windowDates.length)-observed.length)} missing. {kind==="bar"?"Totals exclude missing days.":""}</p>
    </> : <div className="grid min-h-32 place-items-center border border-dashed border-line p-4 text-center text-sm text-muted">No observations available yet. Missing values are not treated as zero.</div>}
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
