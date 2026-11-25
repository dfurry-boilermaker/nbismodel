import { gpuPrices, tokenFactory, openRouter } from "@/lib/load";
import type { HistorySeries } from "@/components/pricing-charts";

type GpuRow = typeof gpuPrices.snapshots[number]["rows"][number];
const gpuId = (r:GpuRow) => [r.sku,r.item,r.term,r.unit].join("|");
const gpuLabel = (r:GpuRow) => r.sku.replaceAll("NVIDIA® ","") + " · " + r.term + (r.priceIsFloor ? " (floor)" : "");
const gpuSnapshots = gpuPrices.snapshots;
const gpuLatest = gpuSnapshots.at(-1)?.rows.filter(r=>r.unit==="gpu-hour") ?? [];
const gpuAll = new Map(gpuSnapshots.flatMap(s=>s.rows.filter(r=>r.unit==="gpu-hour").map(r=>[gpuId(r),r] as const)));
export const gpuHistory:HistorySeries[] = [...gpuAll].map(([id,r])=>({id,label:gpuLabel(r),points:gpuSnapshots.map(s=>({date:s.retrievedAt,value:s.rows.find(row=>gpuId(row)===id)?.priceUsd??null}))}));
export const gpuBars = gpuLatest.filter(r=>r.term==="on-demand").sort((a,b)=>b.priceUsd-a.priceUsd).map(r=>({label:gpuLabel(r),value:r.priceUsd}));

type Flavor = typeof tokenFactory.snapshots[number]["models"][number]["flavors"][number];
const tokenRows = (s:typeof tokenFactory.snapshots[number]) => s.models.flatMap(m=>m.flavors.map(f=>({name:m.name,f})));
const flavorId = (f:Flavor) => [f.modelId,f.label,f.quantization].join("|");
const tokenAll = new Map(tokenFactory.snapshots.flatMap(s=>tokenRows(s).map(r=>[flavorId(r.f),r] as const)));
const tokenLatest = tokenFactory.snapshots.at(-1);
const tokenMetrics = ["inputUsdPerMillion","outputUsdPerMillion","cachedInputUsdPerMillion"] as const;
const metricLabels = {inputUsdPerMillion:"Input",outputUsdPerMillion:"Output",cachedInputUsdPerMillion:"Cached input"};
const price = (f:Flavor|undefined,key:typeof tokenMetrics[number]) => (f as Partial<Record<typeof tokenMetrics[number],number|null>>|undefined)?.[key]??null;
export const tokenHistory:HistorySeries[] = [...tokenAll].flatMap(([id,r])=>tokenMetrics.map(key=>({id:id+"|"+key,label:r.name+" · "+r.f.label+" · "+metricLabels[key],points:tokenFactory.snapshots.map(s=>({date:s.retrievedAt,value:price(tokenRows(s).find(x=>flavorId(x.f)===id)?.f,key)}))})));
export const speedHistory:HistorySeries[] = [...tokenAll].map(([id,r])=>({id,label:r.name+" · "+r.f.label,points:tokenFactory.snapshots.map(s=>{const v=tokenRows(s).find(x=>flavorId(x.f)===id)?.f.tokensPerSecond;return {date:s.retrievedAt,value:v && v>0?v:null}})}));
export const speedBars = (tokenLatest?tokenRows(tokenLatest):[]).filter(r=>r.f.tokensPerSecond>0).sort((a,b)=>b.f.tokensPerSecond-a.f.tokensPerSecond).slice(0,8).map(r=>({label:r.name,value:r.f.tokensPerSecond}));
export const tokenBars = (tokenLatest?tokenRows(tokenLatest):[]).filter(r=>r.f.outputUsdPerMillion>0).sort((a,b)=>b.f.outputUsdPerMillion-a.f.outputUsdPerMillion).slice(0,8).map(r=>({label:r.name,value:r.f.outputUsdPerMillion}));

const routerIds = [...new Set(openRouter.history.flatMap(s=>s.prices.map(p=>p.id)))];
const routerNames = new Map(openRouter.models.map(m=>[m.id,m.name]));
export const routerHistory:HistorySeries[] = routerIds.flatMap(id=>(["promptPerToken","completionPerToken"] as const).map(key=>({id:id+"|"+key,label:(routerNames.get(id)??id)+" · "+(key==="promptPerToken"?"Input":"Output"),points:openRouter.history.map(s=>{const v=s.prices.find(p=>p.id===id)?.[key];return {date:s.retrievedAt,value:v==null?null:v*1e6}})})));
export const modelCountHistory:HistorySeries[] = [{id:"router",label:"OpenRouter models with Nebius endpoints",points:openRouter.history.map(s=>({date:s.retrievedAt,value:s.modelCount}))},{id:"factory",label:"Token Factory catalog models",points:tokenFactory.snapshots.map(s=>({date:s.retrievedAt,value:s.models.length}))}];
export const routerBars = openRouter.models.flatMap(m=>{const p=m.nebius[0]?.completionPerToken;return p==null?[]:[{label:m.name,value:p*1e6}]}).sort((a,b)=>b.value-a.value).slice(0,8);
