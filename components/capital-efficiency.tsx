"use client";

import { useMemo, useState } from "react";
import { GPU_CASES, gpuEconomics, projectedCapitalEfficiency, type GpuInputs, type HistoricalPoint } from "@/lib/capital-efficiency";
import type { CaseName } from "@/lib/dcf";

const colors = ["#38bdf8", "#f59e0b", "#a78bfa"];
const usd = (v:number) => v.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0});
const pct = (v:number|null) => v === null ? "—" : (100*v).toFixed(1)+"%";
const ratio = (v:number|null) => v === null ? "—" : v.toFixed(2)+"x";
const decimal = (v:number|null) => v === null ? "—" : v.toFixed(1);
const bn = (v:number) => (v/1000).toFixed(1);
type Series = { label:string; values:(number|null)[] };
function Plot({title, detail, labels, series, format, stacked=false}:{
  title:string; detail:string; labels:string[]; series:Series[];
  format:(v:number)=>string; stacked?:boolean;
}) {
  const values = stacked ? labels.map((_,i)=>series.reduce((n,s)=>n+(s.values[i]??0),0)) : series.flatMap(s=>s.values).filter((x):x is number=>x!==null);
  const lo = Math.min(0,...values), hi = Math.max(0,...values);
  const span = hi-lo || 1, left=64, right=620, top=12, bottom=178;
  const x = (i:number)=>left+(right-left)*(i+.5)/Math.max(1,labels.length);
  const y = (v:number)=>bottom-(v-lo)/span*(bottom-top);
  const bw = Math.min(34,(right-left)/Math.max(1,labels.length)*.65);
  return <figure className="min-w-0 rounded-lg border border-line bg-panel p-3 sm:p-4">
    <h3 className="font-medium">{title}</h3><p className="mt-1 text-xs leading-5 text-muted">{detail}</p>
    <svg viewBox="0 0 640 210" className="mt-3 h-auto w-full" role="img" aria-label={title+"; values available in the data tables below"}>
      {[lo,lo+span/2,hi].map((v,i)=><g key={i}><line x1={left} x2={right} y1={y(v)} y2={y(v)} stroke="currentColor" opacity=".14"/><text x={left-7} y={y(v)+4} textAnchor="end" fill="currentColor" fontSize="12">{format(v)}</text></g>)}
      {lo<0 && hi>0 && <line x1={left} x2={right} y1={y(0)} y2={y(0)} stroke="currentColor" opacity=".5" strokeDasharray="4 4"/>}
      {stacked ? labels.map((label,i)=>{
        let offset=0;
        return <g key={label}>{series.map((s,j)=>{const v=s.values[i]??0; const base=offset;offset+=v;return <rect key={s.label} x={x(i)-bw/2} y={y(offset)} width={bw} height={Math.max(0,y(base)-y(offset))} fill={colors[j%colors.length]} rx="1"><title>{label}: {s.label} {format(v)}</title></rect>})}</g>
      }) : series.map((s,j)=><g key={s.label}>
        {s.values.map((v,i)=>i>0&&v!==null&&s.values[i-1]!==null?<line key={i} x1={x(i-1)} y1={y(s.values[i-1]!)} x2={x(i)} y2={y(v)} stroke={colors[j%colors.length]} strokeWidth="2.5"/>:null)}
        {s.values.map((v,i)=>v===null?null:<circle key={i} cx={x(i)} cy={y(v)} r="3.3" fill={colors[j%colors.length]}><title>{labels[i]}: {s.label} {format(v)}</title></circle>)}
      </g>)}
      {labels.map((l,i)=><text key={l} x={x(i)} y="198" textAnchor="middle" fill="currentColor" fontSize="11">{l.replace("20","’")}</text>)}
    </svg>
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">{series.map((s,i)=><span key={s.label} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{background:colors[i%colors.length]}}/>{s.label}</span>)}</div>
  </figure>;
}
function Stat({label,value,note}:{label:string;value:string;note?:string}) {
  return <div className="min-w-0 rounded-lg border border-line bg-panel p-3"><div className="text-xs text-muted">{label}</div><div className="mt-1 break-words font-mono text-xl">{value}</div>{note&&<p className="mt-1 text-xs text-muted">{note}</p>}</div>;
}
const cases = ["bear","base","bull"] as const;
const fields: {key:keyof GpuInputs; label:string; min:number;max:number;step:number;format:(v:number)=>string}[]=[
  {key:"cost",label:"All-in investment per GPU",min:20000,max:100000,step:2500,format:usd},
  {key:"utilization",label:"Billable utilization",min:.3,max:1,step:.05,format:pct},
  {key:"hourlyPrice",label:"Realized price / GPU hour",min:.5,max:8,step:.25,format:v=>"$"+v.toFixed(2)},
  {key:"margin",label:"Cash operating margin before depreciation",min:.2,max:.85,step:.05,format:pct},
  {key:"computeShare",label:"Compute share of initial CapEx",min:.4,max:.9,step:.05,format:pct},
  {key:"gpuLife",label:"GPU economic life",min:3,max:8,step:1,format:v=>v+" years"},
  {key:"facilityLife",label:"Facility economic life",min:10,max:30,step:1,format:v=>v+" years"},
  {key:"wacc",label:"Cost of capital",min:.06,max:.2,step:.005,format:pct},
];
export function CapitalEfficiency({history}:{history:HistoricalPoint[]}) {
  const [name,setName]=useState<CaseName>("base");
  const [gpu,setGpu]=useState<GpuInputs>({...GPU_CASES.base});
  const projections=useMemo(()=>cases.map(c=>({name:c,...projectedCapitalEfficiency(c)})),[]);
  const selected=projections.find(p=>p.name===name)!;
  const rows=selected.rows, labels=rows.map(r=>String(r.year));
  const unit=gpuEconomics(gpu);
  const historicalLabels=history.map(h=>h.label);
  const moneyB=(v:number)=>"$"+bn(v)+"B";
  const moneyShare=(v:number)=>"$"+v.toFixed(1);
  const changeCase=(c:CaseName)=>{setName(c);setGpu({...GPU_CASES[c]});};
  return <div className="space-y-6">
    <div className="rounded-lg border border-line bg-panel p-4">
      <div className="eyebrow">/ Capital efficiency / Scenario diagnostics</div>
      <p className="mt-2 text-sm leading-6 text-muted">How much durable revenue and cash flow does each dollar of infrastructure investment generate? The projections below reuse the existing DCF and financing assumptions. They do not replace its headline valuation. GPU-level assumptions are independent illustrations, not company disclosures or inputs to the existing DCF.</p>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Select scenario">
        {cases.map(c=><button type="button" key={c} aria-pressed={name===c} onClick={()=>changeCase(c)} className={`rounded-md border px-4 py-2 text-sm capitalize ${name===c?"border-accent text-accent":"border-line text-muted"}`}>{c}</button>)}
      </div>
    </div>
    <section className="space-y-3">
      <h3 className="text-lg font-medium">GPU investment calculator</h3>
      <p className="text-sm text-muted">Illustrative steady-state per-GPU economics, including allocated data center costs. List prices are not realized rates; OpenRouter-wide token traffic is not Nebius utilization.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-line bg-panel p-4">
          {fields.map(f=><label key={f.key} className="block text-sm">
            <span className="flex justify-between gap-3"><span>{f.label}</span><span className="shrink-0 font-mono text-accent">{f.format(gpu[f.key])}</span></span>
            <input aria-label={f.label} className="mt-2 w-full accent-sky-500" type="range" min={f.min} max={f.max} step={f.step} value={gpu[f.key]} onChange={e=>setGpu(p=>({...p,[f.key]:Number(e.target.value)}))}/>
          </label>)}
          <button type="button" className="rounded-md border border-line px-3 py-2 text-sm" onClick={()=>setGpu({...GPU_CASES[name]})}>Reset {name} assumptions</button>
        </div>
        <div className="grid grid-cols-2 gap-3 content-start">
          <Stat label="Annual revenue / GPU" value={usd(unit.revenue)}/>
          <Stat label="Revenue / growth capital" value={ratio(unit.revenuePerCapital)}/>
          <Stat label="Simple after-tax payback" value={unit.payback===null?"—":decimal(unit.payback)+" yrs"} note="Before replacements"/>
          <Stat label="EBIT margin" value={pct(unit.operatingMargin)}/>
          <Stat label="Annual replacement reserve" value={usd(unit.depreciation)} note="Straight-line cost / life"/>
          <Stat label="Normalized after-tax cash" value={usd(unit.normalizedCash)} note="After replacement reserve"/>
          <Stat label="Incremental ROIC proxy" value={pct(unit.roic)} note="NOPAT / initial all-in cost"/>
          <Stat label="ROIC − WACC" value={(unit.spread*100).toFixed(1)+" pp"} note={unit.spread>=0?"Above assumed cost of capital":"Below assumed cost of capital"}/>
        </div>
      </div>
      <p className="text-xs leading-5 text-muted">Uses 8,760 hours/year, 25.8% modeled tax on positive EBIT, separate compute and facility lives and zero salvage. Payback ignores ramp, working capital, financing, price erosion and actual replacement timing. The replacement reserve is not a disclosed cash-spend schedule.</p>
    </section>
    <section className="space-y-3">
      <h3 className="text-lg font-medium">Historical capital productivity</h3>
      <p className="text-sm text-muted">Reported group results from the financials dataset. Growth/replacement splits and realized GPU prices are not inferred from total CapEx.</p>
      <div className="grid gap-3 lg:grid-cols-2">
        <Plot title="Quarterly revenue and CapEx" detail="Reported USD millions; cash CapEx shown as a positive outflow." labels={historicalLabels} series={[{label:"Revenue",values:history.map(h=>h.revenue)},{label:"Total CapEx",values:history.map(h=>h.capex)}]} format={moneyB}/>
        <Plot title="Lagged capital productivity" detail="Change in trailing-12-month revenue / preceding trailing-12-month total CapEx. Proxy, not incremental growth-CapEx return." labels={historicalLabels} series={[{label:"Historical proxy",values:history.map(h=>h.laggedProductivity)}]} format={v=>v.toFixed(2)+"x"}/>
      </div>
      <div className="overflow-x-auto rounded-lg border border-line"><table className="w-full whitespace-nowrap text-left text-xs"><thead className="bg-panel text-muted"><tr>{["Quarter","Revenue ($m)","CapEx ($m)","Adj. EBITDA margin","Lagged proxy"].map(h=><th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead><tbody>{history.map(h=><tr key={h.label} className="border-t border-line"><td className="p-3">{h.label}</td><td className="p-3 font-mono">{decimal(h.revenue)}</td><td className="p-3 font-mono">{decimal(h.capex)}</td><td className="p-3 font-mono">{pct(h.ebitdaMargin)}</td><td className="p-3 font-mono">{ratio(h.laggedProductivity)}</td></tr>)}</tbody></table></div>
      <p className="text-xs text-muted">Source: <a className="underline" href="/financials">Financials and original filings</a>. At least eight quarters are required for the lagged proxy; it includes non-recurring and non-cloud revenue.</p>
    </section>
    <section className="space-y-3">
      <h3 className="text-lg font-medium capitalize">{name} case · DCF capital efficiency through 2035</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="DCF assumed utilization" value={pct(selected.utilization)} note="Scenario input, not actual"/>
        <Stat label="New capacity revenue / MW / year" value={"$"+selected.annualRevenuePerMw.toFixed(1)+"m"} note="Before utilization; not a GPU-hour price"/>
        <Stat label="Fleet all-in cash payback" value={(selected.payback.fleetAllIn/12).toFixed(1)+" yrs"} note="Existing DCF, pre-tax"/>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Plot title="Growth vs. modeled GPU replacement CapEx" detail="USD billions; replacement reflects existing DCF GPU refreshes, not full facility replacement." labels={labels} series={[{label:"Growth / prebuild",values:rows.map(r=>r.growth)},{label:"GPU refresh",values:rows.map(r=>r.replacement)}]} format={moneyB} stacked/>
        <Plot title="Lagged revenue per growth CapEx" detail="Annual revenue change / prior-year modeled growth spend. Timing proxy, not cohort attribution." labels={labels} series={[{label:"Revenue / growth CapEx",values:rows.map(r=>r.productivity)}]} format={v=>v.toFixed(2)+"x"}/>
        <Plot title="Operating margin after depreciation" detail="Modeled EBIT deducts SBC, customer financing component and estimated book depreciation." labels={labels} series={[{label:"Model EBITDA margin",values:rows.map(r=>r.ebitdaMargin)},{label:"Estimated EBIT margin",values:rows.map(r=>r.ebitMargin)}]} format={v=>pct(v)}/>
        <Plot title="Return on capital vs. cost of capital" detail="NOPAT / average modeled net fixed assets; proxy, not full balance-sheet ROIC." labels={labels} series={[{label:"ROIC proxy",values:rows.map(r=>r.roic)},{label:"WACC",values:rows.map(r=>r.wacc)}]} format={v=>pct(v)}/>
        <Plot title="Equity cash flow per projected diluted share" detail="FCFE after modeled debt flows and cash interest; excludes proceeds from equity issuance." labels={labels} series={projections.map(p=>({label:p.name,values:p.rows.map(r=>r.fcfePerShare)}))} format={moneyShare}/>
        <Plot title="Projected diluted share count" detail="Opening conversion-adjusted shares plus modeled equity issuance at the existing reference price." labels={labels} series={projections.map(p=>({label:p.name,values:p.rows.map(r=>r.shares/1e6)}))} format={v=>v.toFixed(0)+"m"}/>
      </div>
      <div className="overflow-x-auto rounded-lg border border-line"><table className="w-full whitespace-nowrap text-left text-xs"><thead className="bg-panel text-muted"><tr>{["Year","Growth ($bn)","Refresh ($bn)","D&A ($bn)","Revenue / growth","EBIT margin","ROIC proxy","WACC","FCFE/share","Shares (m)"].map(h=><th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.year} className="border-t border-line font-mono">{[r.year,bn(r.growth),bn(r.replacement),bn(r.depreciation),ratio(r.productivity),pct(r.ebitMargin),pct(r.roic),pct(r.wacc),moneyShare(r.fcfePerShare),(r.shares/1e6).toFixed(1)].map((v,i)=><td key={i} className="p-3">{v}</td>)}</tr>)}</tbody></table></div>
      <details className="rounded-lg border border-line bg-panel p-4 text-sm"><summary className="cursor-pointer font-medium">Methodology, assumptions and limitations</summary>
        <div className="mt-3 space-y-2 text-xs leading-5 text-muted">
          <p>Projection starts in 2027 because the existing DCF models only Q4 2026. Its 2026–27 build spend is classified as growth; later GPU refreshes use the existing cohort schedule. Prebuild credits reduce future growth spending. Facility replacement is not explicitly scheduled in the DCF forecast.</p>
          <p>Book depreciation proxy uses opening modeled tax basis (not reported net PP&amp;E), a 4.5-year remaining compute life, 15-year facility life and midpoint commissioning of new spend over five and 15 years respectively. ROIC excludes working capital, leases and other balance-sheet capital; it is a fixed-asset return proxy, not reported ROIC.</p>
          <p>FCFE proxy = existing FCFF less cash interest and debt principal repayments plus modeled debt issuance. No incremental interest tax shield is assumed. Shares use opening DCF conversion-adjusted dilution and midpoint weighted new equity issues at the model reference price of {usd(selected.fundingPrice)}. Future SBC issuance, financing repricing and repurchases are not independently modeled. This is a financing sensitivity, not a new equity DCF.</p>
          <p>All scenario assumptions are illustrative. Realized GPU hourly pricing, utilization and growth/replacement splits are not asserted as reported historical data.</p>
        </div>
      </details>
    </section>
  </div>;
}
