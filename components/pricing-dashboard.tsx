import {HistoryChart, type HistorySeries} from "@/components/pricing-charts";
import {gpuHistory,tokenHistory,speedHistory,routerHistory,modelCountHistory} from "@/lib/pricing-history";
import usageJson from "@/data/pricing/openrouter-usage.json";

type Usage = {asOf:string|null;days:{date:string;total:number;models:{id:string;tokens:number}[]}[]};
const usage=usageJson as Usage;
const ids=[...new Set(usage.days.flatMap(d=>d.models.map(m=>m.id)))].sort();
const series:HistorySeries[] = [{id:"all",label:"All ranked and other public model traffic",points:usage.days.map(d=>({date:d.date,value:d.total/1e9}))},...ids.map(id=>({id,label:id,points:usage.days.map(d=>{const r=d.models.find(m=>m.id===id);return {date:d.date,value:r?r.tokens/1e9:null}})}))];

export function UsageCharts(){
  return <section className="space-y-2"><h2 className="text-xl font-medium">Token usage and adoption</h2>
    <HistoryChart title="OpenRouter daily token consumption" kind="bar" series={series} unit="Billions of input + output tokens / UTC day" note="Across providers, not Nebius-specific usage. Models outside the daily top 50 have no separate observation; missing does not mean zero. Tokenizers differ across models."/>
    <p className="text-xs text-muted">Source: <a className="underline" href="https://openrouter.ai/rankings">OpenRouter (openrouter.ai/rankings)</a>, as of {usage.asOf??"not yet retrieved"}. <a className="underline" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. {!usage.asOf && "Usage history will appear once the authorized daily dataset refresh succeeds."}</p>
    <HistoryChart title="Model availability" series={modelCountHistory} unit="Catalog model count" note="Supply-side indicator, not customer usage or revenue."/>
  </section>
}
export function GpuCharts(){
  return <HistoryChart title="GPU-hour price history" unit="USD / GPU-hour" series={gpuHistory} money compare note="Compare two GPU SKUs or pricing terms on a common axis. Preemptible floors are not actual spot rates. L40S has separate CPU and RAM charges."/>
}
export function FactoryCharts(){
  return <div className="grid min-w-0 gap-3 lg:grid-cols-2">
    <HistoryChart title="Token Factory input price history" series={tokenHistory.filter(s=>s.id.endsWith("|inputUsdPerMillion")||s.id.endsWith("|cachedInputUsdPerMillion"))} unit="USD / million input tokens" money compare/>
    <HistoryChart title="Token Factory output price history" series={tokenHistory.filter(s=>s.id.endsWith("|outputUsdPerMillion"))} unit="USD / million output tokens" money compare/>
    <div className="lg:col-span-2"><HistoryChart title="Catalog throughput history" series={speedHistory} unit="Tokens / second" compare note="Published catalog speed, not actual token consumption."/></div>
  </div>
}
export function RouterCharts(){
  return <div className="grid min-w-0 gap-3 lg:grid-cols-2">
    <HistoryChart title="OpenRouter Nebius input pricing" series={routerHistory.filter(s=>s.id.endsWith("|promptPerToken"))} unit="USD / million input tokens" money compare note="First listed Nebius endpoint per model; endpoint mix can change."/>
    <HistoryChart title="OpenRouter Nebius output pricing" series={routerHistory.filter(s=>s.id.endsWith("|completionPerToken"))} unit="USD / million output tokens" money compare note="First listed Nebius endpoint per model; endpoint mix can change."/>
  </div>
}
