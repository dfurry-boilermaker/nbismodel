import { readFileSync } from "node:fs";
import { financials, guidance } from "../lib/load";
import { scoreGuidance, groupGuidance, guidanceStatusLabel } from "../lib/guidance";
import {
  BASIC_ECONOMIC_SHARES,
  CASES,
  COMPUTE_SHARE_OF_CAPEX,
  DISCLOSED_PAYBACK_MONTHS,
  MODEL_VERSION,
  REFERENCE_CLOSE,
  allCases,
  financingPanel,
  runCase,
  sideRuns,
  weightedRaw,
  weightedValue,
  PRICE_TARGET_DATE,
  TARGET_ASSUMPTIONS, PEER_MULTIPLE, MARKET_CLOSE,
  twelveMonthPriceTarget,
} from "../lib/dcf";
import { priceBand, realizedVol } from "../lib/vol";
import { GPU_CASES, gpuEconomics, historicalCapitalEfficiency, projectedCapitalEfficiency } from "../lib/capital-efficiency";

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
if (guidanceStatusLabel("ahead") !== "beat") throw new Error("Beat display label");
const grouped = groupGuidance(guidance.items, "2026-11-25");
if (grouped[0]?.year !== 2026 || grouped.at(-1)?.year !== 2025) throw new Error("Current-year-first guidance ordering");
if (grouped.flatMap(group => group.items).length !== guidance.items.length) throw new Error("Missing grouped guidance items");
const active = guidance.items.find((item) => item.id === "active-power-2025");
if (!active || scoreGuidance(active, "2026-11-23").status !== "ahead") {
  throw new Error("Active power should score ahead");
}
const december = guidance.items.find((item) => item.id === "arr-dec-2026");
if (!december || scoreGuidance(december, "2026-11-23").status !== "superseded") {
  throw new Error("December 2026 ARR should be superseded");
}

if (MODEL_VERSION !== "4.1.0") throw new Error(`model version ${MODEL_VERSION}`);
if (BASIC_ECONOMIC_SHARES !== 313_968_341) throw new Error(`basic shares ${BASIC_ECONOMIC_SHARES}`);
if (REFERENCE_CLOSE.value !== 87.31 || REFERENCE_CLOSE.asOf !== "2026-11-24") throw new Error("hand-entered close drifted");
if (COMPUTE_SHARE_OF_CAPEX !== 0.7) throw new Error("compute share");
if ([CASES.bear.weight, CASES.base.weight, CASES.bull.weight].join() !== "0.35,0.45,0.2") throw new Error("weights");
if (CASES.bull.util !== 0.92 || Math.max(...CASES.bull.mw_ye) > 5500) throw new Error("bull cap");

const [bear, base, bull] = allCases();
const cases = [bear, base, bull];
for (let i = 0; i < base.rows.length; i += 1) {
  const rev = cases.map((item) => item.rows[i].revenue);
  const ebit = cases.map((item) => item.rows[i].ebitda);
  if (rev[0] > rev[1] + 1e-6 || rev[1] > rev[2] + 1e-6) throw new Error(`revenue order ${base.rows[i].year}`);
  if (ebit[0] > ebit[1] + 1e-6 || ebit[1] > ebit[2] + 1e-6) throw new Error(`ebitda order ${base.rows[i].year}`);
}
const raw = cases.map((item) => item.bridge.perShareRaw);
const evs = cases.map((item) => item.ev);
if (!(raw[0] <= raw[1] && raw[1] <= raw[2])) throw new Error(`raw value ${raw}`);
if (!(evs[0] <= evs[1] && evs[1] <= evs[2])) throw new Error(`ev order ${evs}`);
if (!(bear.fy2026 <= base.fy2026 && base.fy2026 <= bull.fy2026)) throw new Error("fy2026 order");
for (const item of cases) {
  if (item.bridge.perShare !== Math.max(0, item.bridge.perShareRaw)) throw new Error("floor");
  if (!(3000 * 0.75 <= item.fy2026 && item.fy2026 <= 3400 * 1.25)) throw new Error(`${item.name} fy2026 ${item.fy2026}`);
  if (!(12000 * 0.75 <= item.fy2027 && item.fy2027 <= 13000 * 1.25)) throw new Error(`${item.name} fy2027 ${item.fy2027}`);
  for (const row of item.rows) {
    const identity = row.ebitda - row.sfc - row.sbc - row.cashTax - row.capexNet + row.dDr;
    if (Math.abs(identity - row.fcff) > 1e-4) throw new Error(`fcff identity ${item.name} ${row.year}`);
  }
}
if (Math.abs(base.fy2026 / 3000 - 1) > 0.05) throw new Error("base 2026 guide");
if (base.fy2027 < 12000 || base.fy2027 > 13000) throw new Error("base 2027 guide");
if (Math.abs(base.q3Engine / 655.7 - 1) > 0.1) throw new Error(`q3 backtest ${base.q3Engine}`);
const pay = { bear: bear.payback.deal, base: base.payback.deal, bull: bull.payback.deal };
if (!(DISCLOSED_PAYBACK_MONTHS * 0.75 <= pay.base && pay.base <= DISCLOSED_PAYBACK_MONTHS * 1.25)) throw new Error(`payback ${pay.base}`);
if (!(pay.bull <= pay.base && pay.base <= pay.bear)) throw new Error("payback order");
if (!(base.payback.npv > 0)) throw new Error("base megawatt npv");
for (const share of [0.6, 0.7, 0.8]) {
  const months = runCase("base", { computeShare: share }).payback.deal;
  if (!(DISCLOSED_PAYBACK_MONTHS * 0.75 <= months && months <= DISCLOSED_PAYBACK_MONTHS * 1.25)) throw new Error(`compute share payback ${share}`);
}
const flat = runCase("base", { price_decline: 0, cost_decline: 0 });
const both = runCase("base", { price_decline: 0.05, cost_decline: 0.05 });
for (const year of [2028, 2029, 2030, 2031]) {
  if (!flat.revByStart[year] || !flat.itByStart[year]) continue;
  const rr = both.revByStart[year] / flat.revByStart[year];
  const rc = both.itByStart[year] / flat.itByStart[year];
  if (Math.abs(rr - rc) > 1e-6) throw new Error(`symmetric decline ${year}`);
}
const saved = REFERENCE_CLOSE.value;
const before = rawHeadlineSnapshot();
REFERENCE_CLOSE.value = 1e6;
const after = rawHeadlineSnapshot();
REFERENCE_CLOSE.value = saved;
if (before.join() !== after.join()) throw new Error("headline used the hand-entered close");
const atClose = claimsAt(87.31);
if (Math.abs(atClose.claims - 14010.8) > 0.05 || Math.round(atClose.shares) !== 322_863_171) {
  throw new Error(`bridge tie ${atClose.claims} ${atClose.shares}`);
}
const sides = sideRuns();
if (Math.abs(sides.guide.raw - 51.32) > 0.02) throw new Error(`guide run ${sides.guide.raw}`);
if (Math.abs(sides.lag.raw - 81.69) > 0.02) throw new Error(`lag run ${sides.lag.raw}`);
if (Math.abs(sides.sfc0 - 122.12) > 0.02 || Math.abs(sides.sfc7 - 84.89) > 0.02) throw new Error(`sfc ${sides.sfc0} ${sides.sfc7}`);
if (Math.abs(base.bridge.perShareRaw - 95.67) > 0.02) throw new Error(`base ${base.bridge.perShareRaw}`);
if (Math.abs(bear.bridge.perShareRaw + 209.29) > 0.02) throw new Error(`bear ${bear.bridge.perShareRaw}`);
if (Math.abs(bull.bridge.perShareRaw - 488.46) > 0.02) throw new Error(`bull ${bull.bridge.perShareRaw}`);
const shown = weightedValue(cases);
const unfloored = weightedRaw(cases);
if (Math.abs(shown - 140.74) > 0.02 || Math.abs(unfloored - 67.49) > 0.02) throw new Error(`weights ${shown} ${unfloored}`);
for (const item of cases) {
  const quiet = runCase(item.name, { prepay_q4_2026: 0, prepay_2027: 0, prepay_share: 0 });
  const rel = Object.fromEntries(quiet.rows.map((row) => [row.year, row.release]));
  const nc = 9409.2 - 1445.5;
  if (Math.abs(rel[2026] - 1445.5 / 4) > 1e-4) throw new Error(`${item.name} 2026 opening release`);
  if (Math.abs(rel[2027] - (1445.5 * 3) / 4 - nc / 16) > 1e-4) throw new Error(`${item.name} 2027 opening release ${rel[2027]}`);
  for (const year of [2028, 2029, 2030]) if (Math.abs(rel[year] - nc / 4) > 1e-4) throw new Error(`${item.name} ${year} release`);
  if (Math.abs(rel[2031] - (nc * 3) / 16) > 1e-4 || rel[2032] > 1e-6) throw new Error(`${item.name} release end`);
}
if (runCase("base", { abf_share: 0, kd: 0.15 }).ev !== base.ev) throw new Error("financing leaked into the headline");

function rawHeadlineSnapshot(): number[] {
  return allCases().map((item) => item.bridge.perShareRaw);
}

function claimsAt(value: number) {
  if (!(value > 0)) throw new Error("tie-out price");
  const carryingLeft = 13429.7 - 91.2 - 89.8;
  return {
    claims: carryingLeft + 733.1 + 28 + 1,
    shares: 313_968_341 + 5_493_478 + 1_700_676 + 1_700_676,
  };
}

// Every asset-backed draw is repaid in five equal annual installments, not
// five percent-of-remaining-balance periods. Reconcile the rolling balance.
for (const item of cases) {
  const panel = financingPanel(item);
  let balance = 0;
  for (const row of panel.fundingRows) {
    const expected = panel.fundingRows
      .filter((prior) => prior.year < row.year && prior.year >= row.year - 5)
      .reduce((sum, prior) => sum + prior.abfDraw / 5, 0);
    if (Math.abs(row.abfAmort - expected) > 1e-6) throw new Error(`ABF amortization ${item.name} ${row.year}`);
    balance += row.abfDraw - row.abfAmort;
    if (Math.abs(balance - row.abfEnding) > 1e-6 || row.abfEnding < -1e-6) throw new Error("ABF balance");
    if (row.endingCash < 2000 - 1e-6) throw new Error("cash floor");
  }
  if (Math.abs(panel.fundingRows.reduce((sum, row) => sum + row.equityDraw, 0) - panel.equity) > 1e-6) throw new Error("equity funding bridge");
}

const quoteSnapshot = JSON.parse(readFileSync("data/market/quotes.json", "utf8"));
if (quoteSnapshot.points.length !== 21 || quoteSnapshot.points.at(-1).close !== MARKET_CLOSE.value || quoteSnapshot.points.at(-1).date !== MARKET_CLOSE.asOf || !realizedVol(quoteSnapshot.points.map((p: { close: number }) => p.close))) throw new Error("dated quote snapshot");
const band = priceBand({ price: 100, annualVol: 0.8, horizonDays: 5, z: 1.96 });
if ("error" in band || !(band.low < 100 && band.high > 100)) throw new Error("Vol band");

const gpu = JSON.parse(readFileSync("data/pricing/gpu.json", "utf8"));
const h100 = gpu.snapshots.at(-1).rows.find((row: { item: string; term: string }) => row.item.includes("H100") && row.term === "on-demand" && !row.item.startsWith("Preempt"));
if (!h100 || h100.priceUsd !== 4.5) throw new Error(`H100 price ${h100?.priceUsd}`);

console.log("validate ok", {
  version: MODEL_VERSION,
  bear: bear.bridge.perShare,
  bearRaw: bear.bridge.perShareRaw,
  base: base.bridge.perShare,
  baseRaw: base.bridge.perShareRaw,
  bull: bull.bridge.perShare,
  bullRaw: bull.bridge.perShareRaw,
  weighted: shown,
  weightedRaw: unfloored,
  side: [sides.guide.raw, sides.lag.raw, sides.sfc0, sides.sfc7],
  band,
});

const historicalEfficiency = historicalCapitalEfficiency(financials.quarters);
if (historicalEfficiency.slice(0,7).some(r=>r.laggedProductivity!==null)) throw new Error("historical proxy requires eight quarters");
const unit = gpuEconomics(GPU_CASES.base);
if (Math.abs(unit.revenue-24528)>1e-6 || Math.abs(unit.depreciation-7200)>1e-6) throw new Error("GPU economics arithmetic");
if (!(gpuEconomics({...GPU_CASES.base,utilization:.5}).roic<unit.roic)) throw new Error("GPU utilization sensitivity");
for (const item of cases) {
  for (const r of item.rows) {
    if (Math.abs(r.growthCapex+r.replacementCapex-r.capexNet)>1e-6) throw new Error("growth/refresh capex tie-out");
    if (Math.abs(r.computeCapex+r.facilityCapex-r.capexNet)>1e-6) throw new Error("compute/facility capex tie-out");
  }
  const p = projectedCapitalEfficiency(item.name);
  const funding = financingPanel(item);
  if (p.rows.length!==9 || p.rows[0].year!==2027 || p.rows[0].productivity!==null) throw new Error("capital efficiency year alignment");
  if (Math.abs(p.rows.at(-1)!.shares-item.bridge.shares-funding.newShares)>1e-5) throw new Error("projected dilution reconciliation");
  for (const r of p.rows) {
    const f = funding.fundingRows.find(x=>x.year===r.year)!;
    if (Math.abs(r.fcfe+f.cashInterest+f.termLoanPrincipal+f.notePrincipal+f.abfAmort-f.abfDraw-f.corporateDraw-r.fcff)>1e-6) throw new Error("FCFE debt flow reconciliation");
    if (!Number.isFinite(r.fcfePerShare) || r.depreciation<0 || r.shares<=0 || r.roic===null || !Number.isFinite(r.roic)) throw new Error("invalid capital efficiency projection");
  }
}
console.log("capital efficiency checks ok");

if (PRICE_TARGET_DATE !== "2027-11-24") throw new Error("12-month target date");
const forwardTargets = cases.map(twelveMonthPriceTarget);
for (const target of forwardTargets) {
  if (!Number.isFinite(target.raw) || target.target !== Math.max(0, target.raw) || target.shares <= 0) throw new Error("invalid forward price target");
  const original = cases.find(item => item.name === target.name)!;
  const through2027 = financingPanel(original, []).fundingRows.filter(row => row.year <= 2027);
  const issuance = through2027.reduce((sum, row) => sum + row.equityDraw, 0);
  if (Math.abs(target.equityIssued - issuance) > 1e-6) throw new Error("target financing window");
  if (Math.abs(target.cash - through2027.at(-1)!.endingCash) > 1e-6) throw new Error("target closing cash");
}
const [bearTarget, baseTarget, bullTarget] = forwardTargets;
if (Math.abs(PEER_MULTIPLE - 3.89) > 0.02) throw new Error("peer multiple");
for (const target of forwardTargets) {
  if (target.method !== "forward-ebitda" || Math.abs(target.targetEv - target.nextYearEbitda * TARGET_ASSUMPTIONS[target.name].multiple) > 1e-6) throw new Error("common target method");
  if (Math.abs(target.raw - (target.targetEv + target.cash + target.stakes - target.claims) / target.shares * 1e6) > 1e-6) throw new Error("target equity bridge");
  if (target.lowerEbitdaTarget > target.target || target.lowerMultipleTarget > target.target) throw new Error("target sensitivity");
  if (target.issuePrice !== MARKET_CLOSE.value * (1 - TARGET_ASSUMPTIONS[target.name].issueDiscount)) throw new Error("target issue price");
}
if (!(bearTarget.dcfRaw < 0 && bearTarget.target > 0 && bearTarget.target < baseTarget.target && baseTarget.target < bullTarget.target)) throw new Error("target scenario ordering");
console.log("12-month targets", forwardTargets.map(({ name, target, raw }) => ({ name, target, raw })));
