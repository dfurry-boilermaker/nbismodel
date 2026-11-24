import { readFileSync } from "node:fs";
import { financials, guidance } from "../lib/load";
import { scoreGuidance } from "../lib/guidance";
import { BASIC_ECONOMIC_SHARES, CONVERT_SHARES, MODEL_VERSION, runCase, weightedValue } from "../lib/dcf";
import { priceBand } from "../lib/vol";

const ids = new Set(Object.keys(financials.sources));
function requireSource(id: string, where: string) {
  if (!ids.has(id) && !guidance.sources[id]) {
    throw new Error(`Missing source ${id} at ${where}`);
  }
}

let revenue = 0;
let ebitda = 0;
let net = 0;
for (const quarter of financials.quarters) {
  if (quarter.id.startsWith("2025-")) {
    revenue += quarter.revenue.value ?? 0;
    ebitda += quarter.adjustedEbitda.value ?? 0;
    net += quarter.netIncome.value ?? 0;
  }
  for (const metric of [quarter.revenue, quarter.adjustedEbitda, quarter.netIncome, quarter.capex, quarter.cash]) {
    requireSource(metric.source, quarter.id);
  }
}
if (Math.abs(revenue - 529.8) > 0.05) throw new Error(`2025 revenue sum ${revenue}`);
if (Math.abs(ebitda + 64.9) > 0.05) throw new Error(`2025 ebitda sum ${ebitda}`);
if (Math.abs(net - 29) > 0.05) throw new Error(`2025 net income sum ${net}`);

const arr = guidance.items.find((item) => item.id === "arr-ye-2025");
if (!arr || scoreGuidance(arr, "2026-11-23").status !== "ahead") {
  throw new Error("Year-end 2025 ARR should score ahead");
}
const active = guidance.items.find((item) => item.id === "active-power-2025");
if (!active || scoreGuidance(active, "2026-11-23").status !== "ahead") {
  throw new Error("Active power should score ahead");
}
const december = guidance.items.find((item) => item.id === "arr-dec-2026");
if (!december || scoreGuidance(december, "2026-11-23").status !== "superseded") {
  throw new Error("December 2026 ARR should be superseded");
}

if (MODEL_VERSION !== "2.1.0") throw new Error(`model version ${MODEL_VERSION}`);
if (CONVERT_SHARES !== 68_112_588) throw new Error(`convert shares ${CONVERT_SHARES}`);
if (BASIC_ECONOMIC_SHARES !== 313_968_341) throw new Error(`basic shares ${BASIC_ECONOMIC_SHARES}`);
const base = runCase("base");
const bear = runCase("bear");
const bull = runCase("bull");
const bearPs = bear.bridges.none.perShare;
const basePs = base.bridges.none.perShare;
const bullPs = bull.bridges.all.perShare;
if (!(bearPs < basePs && basePs < 0 && bullPs > basePs)) {
  throw new Error(`case order ${bearPs} ${basePs} ${bullPs}`);
}
if (bear.terminalMethod !== "harvest" || base.terminalMethod !== "gordon") {
  throw new Error(`terminal ${bear.terminalMethod} ${base.terminalMethod}`);
}
const weighted = weightedValue([bear, base, bull]);
if (!Number.isFinite(weighted)) throw new Error(`weighted ${weighted}`);
const recurring = financials.quarters.find((quarter) => quarter.id === "2026-Q3")?.other.find((row) => row.label === "Recurring group revenue");
if (!recurring || Math.abs((recurring.metric.value ?? 0) - 655.7) > 0.05) throw new Error("Q3 recurring revenue");
const band = priceBand({ price: 100, annualVol: 0.8, horizonDays: 5, z: 1.96 });
if ("error" in band || !(band.low < 100 && band.high > 100)) throw new Error("Vol band");

const gpu = JSON.parse(readFileSync("data/pricing/gpu.json", "utf8"));
const h100 = gpu.snapshots.at(-1).rows.find((row: { item: string; term: string }) => row.item.includes("H100") && row.term === "on-demand" && !row.item.startsWith("Preempt"));
if (!h100 || h100.priceUsd !== 4.5) throw new Error(`H100 price ${h100?.priceUsd}`);

console.log("validate ok", {
  version: MODEL_VERSION,
  bear: bear.bridges.none.perShare,
  base: base.bridges.none.perShare,
  baseConverted: base.bridges.all.perShare,
  bull: bull.bridges.all.perShare,
  weighted,
  band,
});
