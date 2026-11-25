import { readFileSync } from "node:fs";
import { financials, guidance } from "../lib/load";
import { scoreGuidance } from "../lib/guidance";
import {
  BASIC_ECONOMIC_SHARES,
  CONVERT_SHARES,
  DEFERRED_REVENUE,
  DISCLOSED_ACTIVE_MW,
  DISCLOSED_PAYBACK_MONTHS,
  MARKET_PRICE,
  MODEL_VERSION,
  TAX_RATE,
  declineSensitivity,
  paybackMonths,
  runCase,
  waccGrowthGrid,
  weightedRaw,
  weightedValue,
} from "../lib/dcf";
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

if (MODEL_VERSION !== "3.1.0") throw new Error(`model version ${MODEL_VERSION}`);
if (CONVERT_SHARES !== 68_112_588) throw new Error(`convert shares ${CONVERT_SHARES}`);
if (BASIC_ECONOMIC_SHARES !== 313_968_341) throw new Error(`basic shares ${BASIC_ECONOMIC_SHARES}`);
if (MARKET_PRICE !== 87.31 || TAX_RATE !== 0.258 || DISCLOSED_ACTIVE_MW !== 170) {
  throw new Error("sourced price, tax rate, or active-power census drifted");
}
if (DISCLOSED_PAYBACK_MONTHS !== 19) throw new Error("payback source drifted");
const base = runCase("base");
const bear = runCase("bear");
const bull = runCase("bull");
if ("fadeShare" in base.assumptions || base.assumptions.costDecline !== 0) {
  throw new Error("fade or a non-zero baseline cost decline is still in the case");
}
if (bear.assumptions.discount !== 0.12 || bear.assumptions.marginSteady !== 0.4 || bear.assumptions.mwCap !== 3000) {
  throw new Error("bear stress inputs drifted");
}
if (Math.max(...Object.values(bear.assumptions.ends)) > bear.assumptions.mwCap) throw new Error("bear fleet exceeds its cap");
const raw = [bear, base, bull].map((result) => result.bridges.none.perShareRaw);
if (!(raw[0] <= raw[1] && raw[1] <= raw[2])) throw new Error(`raw value order ${raw.join(",")}`);
for (let i = 0; i < base.years.length; i += 1) {
  const revenue = [bear, base, bull].map((result) => result.years[i].revenue);
  const ebitda = [bear, base, bull].map((result) => result.years[i].ebitda);
  if (revenue[0] > revenue[1] + 1 || revenue[1] > revenue[2] + 1) throw new Error(`revenue order ${base.years[i].label}`);
  if (ebitda[0] > ebitda[1] + 1 || ebitda[1] > ebitda[2] + 1) throw new Error(`ebitda order ${base.years[i].label}`);
}
for (const result of [bear, base, bull]) {
  if (result.bridges.none.equityRaiseShares !== 0) throw new Error("headline still issues shares");
  if (result.bridges.none.shares > 500_000_000) throw new Error("headline share count includes a future raise");
  const guide = [
    [result.engineRevenue2026, result.assumptions.revenueGuide2026],
    [result.engineRevenue2027, result.assumptions.revenueGuide2027],
  ];
  for (const [engine, target] of guide) {
    if (engine < target * 0.75 || engine > target * 1.25) throw new Error(`${result.name} engine ${engine} vs guide ${target}`);
  }
  if (Math.abs(result.bridges.none.perShare - Math.max(0, result.bridges.none.perShareRaw)) > 1e-6) {
    throw new Error("floor is not max(0, raw)");
  }
}
if (Math.abs(base.deferredDrawn / 1e6 - DEFERRED_REVENUE) > 1) throw new Error(`deferred draw ${base.deferredDrawn}`);
const declines = declineSensitivity("base");
if (declines.map((row) => row.decline).join(",") !== "0,0.1,0.2,0.25") throw new Error("decline grid");
const flat = paybackMonths(37.9 * 0.69, 25, 0.5);
const down = paybackMonths(37.9 * 0.69 * 0.75 ** 5, 25 * 0.75 ** 5, 0.5);
if (!Number.isFinite(base.paybackMonths) || base.disclosedPaybackMonths !== DISCLOSED_PAYBACK_MONTHS || Math.abs(flat - down) > 0.05) {
  throw new Error("payback comparison is missing, or a symmetric decline changed server payback");
}
const gridPoint = waccGrowthGrid().flat().find((cell) => cell.wacc === 0.11 && cell.growth === 0.02);
if (!gridPoint || gridPoint.perShareRaw == null || Math.abs(gridPoint.perShareRaw - base.bridges.none.perShareRaw) > 0.01) {
  throw new Error("sensitivity grid misses the base case");
}
const weighted = weightedValue([bear, base, bull]);
const weightedUnfloored = weightedRaw([bear, base, bull]);
if (!Number.isFinite(weighted) || !Number.isFinite(weightedUnfloored)) throw new Error("weighted");
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
  bearRaw: bear.bridges.none.perShareRaw,
  base: base.bridges.none.perShare,
  baseRaw: base.bridges.none.perShareRaw,
  bull: bull.bridges.none.perShare,
  bullRaw: bull.bridges.none.perShareRaw,
  weighted,
  weightedRaw: weightedUnfloored,
  engine: [bear, base, bull].map((result) => [result.engineRevenue2026, result.engineRevenue2027]),
  payback: [bear, base, bull].map((result) => result.paybackMonths),
  band,
});
