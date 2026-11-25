import {readFile,writeFile} from "node:fs/promises";
const key=process.env.OPENROUTER_API_KEY;
if(!key){console.log("OpenRouter usage skipped: OPENROUTER_API_KEY is not configured");process.exit(0);}
const file="data/pricing/openrouter-usage.json";
const start=new Date(Date.now()-90*86400000).toISOString().slice(0,10);
const url=new URL("https://openrouter.ai/api/v1/datasets/rankings-daily");
url.searchParams.set("start_date",start);
url.searchParams.set("period","day");
const response=await fetch(url,{headers:{Authorization:"Bearer "+key,Accept:"application/json"},signal:AbortSignal.timeout(60000)});
if(!response.ok)throw new Error("OpenRouter usage fetch HTTP "+response.status);
const body=await response.json();
if(!Array.isArray(body.data)||!body.data.length||typeof body.meta?.as_of!=="string")throw new Error("Unexpected rankings response");
const dates=new Map();
for(const row of body.data){
  const total=Number(row.total_tokens);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(row.date)||typeof row.model_permaslug!=="string"||!Number.isFinite(total)||total<0)throw new Error("Invalid rankings row");
  if(!dates.has(row.date))dates.set(row.date,new Map());
  const models=dates.get(row.date);
  if(models.has(row.model_permaslug))throw new Error("Duplicate rankings row");
  models.set(row.model_permaslug,total);
}
const existing=JSON.parse(await readFile(file,"utf8"));
const days=new Map(existing.days.map(day=>[day.date,day]));
for(const [date,models] of dates){
  const entries=[...models].map(([id,tokens])=>({id,tokens}));
  days.set(date,{date,total:entries.reduce((sum,r)=>sum+r.tokens,0),models:entries.filter(r=>r.id!=="other")});
}
await writeFile(file,JSON.stringify({asOf:body.meta.as_of,days:[...days.values()].sort((a,b)=>a.date.localeCompare(b.date)).slice(-365)},null,2)+"\n");
console.log("Updated OpenRouter public model usage:",dates.size,"days");
