import {HistoryChart, PriceBars, type HistorySeries} from "@/components/pricing-charts";
import {gpuHistory,gpuBars,tokenHistory,tokenBars,speedHistory,speedBars,routerHistory,routerBars,modelCountHistory} from "@/lib/pricing-history";
import usageJson from "@/data/pricing/openrouter-usage.json";

type Usage = {asOf:string|null;days:{date:string;total:number;models:{id:string;tokens:number}[]}[]};
const usage=usageJson as Usage;
const ids=[...new Set(usage.days.flatMap(d=>d.models.map(m=>m.id)))].sort();
const series:HistorySeries[] = [{id:"all",label:"All ranked and other public model traffic",points:usage.days.map(d=>({date:d.date,value:d.total/1e9}))},...ids.map(id=>({id,label:id,points:usage.days.map(d=>{const r=d.models.find(m=>m.id===id);return {date:d.date,value:r?r.tokens/1e9:null}})}))];

export function UsageCharts(){
  return <section className="space-y-2"><h2 className="text-xl font-medium">Token usage and adoption</h2>
    <HistoryChart title="OpenRouter daily token volume" series={series} unit="Billions of input + output tokens / UTC day" note="Across providers, not Nebius-specific usage. Models outside the daily top 50 have no separate observation; missing does not mean zero. Tokenizers differ across models."/>
    <p className="text-xs text-muted">Source: <a className="underline" href="https://openrouter.ai/rankings">OpenRouter (openrouter.ai/rankings)</a>, as of {usage.asOf??"not yet retrieved"}. <a className="underline" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. {!usage.asOf && "Usage history will appear once the authorized daily dataset refresh succeeds."}</p>
    <HistoryChart title="Model availability" series={modelCountHistory} unit="Catalog model count" note="Supply-side indicator, not customer usage or revenue."/>
  </section>
}
export function GpuCharts(){return <div className="grid min-w-0 gap-3 lg:grid-cols-2"><HistoryChart title="GPU-hour price history" unit="USD / GPU-hour" series={gpuHistory} money note="Preemptible floors are not actual spot rates. L40S has separate CPU and RAM charges."/><PriceBars title="Current on-demand GPU rates" unit="USD / GPU-hour" rows={gpuBars} note="Separate regional SKUs may share the same list price."/></div>}
export function FactoryCharts(){return <div className="grid min-w-0 gap-3 lg:grid-cols-2"><HistoryChart title="Token Factory price history" series={tokenHistory} unit="USD / million tokens" money/><PriceBars title="Highest listed output rates" rows={tokenBars} unit="USD / million output tokens" note="Top eight positive listed rates, not a usage-weighted average."/><HistoryChart title="Catalog throughput history" series={speedHistory} unit="Tokens / second" note="Published catalog speed, not realized token volume."/><PriceBars title="Highest catalog throughput" rows={speedBars} unit="Tokens / second" money={false} note="Top eight positive speeds; not independently benchmarked."/></div>}
export function RouterCharts(){return <div className="grid min-w-0 gap-3 lg:grid-cols-2"><HistoryChart title="OpenRouter Nebius endpoint pricing" series={routerHistory} unit="USD / million tokens" money note="First listed Nebius endpoint per model; endpoint mix can change."/><PriceBars title="Highest listed Nebius output rates" rows={routerBars} unit="USD / million output tokens" note="Top eight listed rates, not realized revenue."/></div>}
