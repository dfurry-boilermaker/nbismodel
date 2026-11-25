import {
  runCase, financingPanel, OPENING_CAPITAL_PROXY, COMPUTE_SHARE_OF_CAPEX,
  COMPUTE_ASSET_LIFE, FACILITY_ASSET_LIFE, MODEL_TAX_RATE, type CaseName,
} from "@/lib/dcf";
import type { Quarter } from "@/lib/types";

export type GpuInputs = {
  cost: number; utilization: number; hourlyPrice: number; margin: number;
  computeShare: number; gpuLife: number; facilityLife: number; wacc: number;
};
export const GPU_CASES: Record<CaseName, GpuInputs> = {
  bear: { cost: 55000, utilization: .65, hourlyPrice: 2.5, margin: .45, computeShare: .7, gpuLife: 4, facilityLife: 15, wacc: .125 },
  base: { cost: 45000, utilization: .8, hourlyPrice: 3.5, margin: .65, computeShare: .7, gpuLife: 5, facilityLife: 15, wacc: .11 },
  bull: { cost: 40000, utilization: .9, hourlyPrice: 4, margin: .7, computeShare: .7, gpuLife: 6, facilityLife: 15, wacc: .105 },
};

export function gpuEconomics(p: GpuInputs) {
  const revenue = 8760 * p.utilization * p.hourlyPrice;
  const cashProfit = revenue * p.margin;
  const compute = p.cost * p.computeShare;
  const facility = p.cost - compute;
  const depreciation = compute / p.gpuLife + facility / p.facilityLife;
  const ebit = cashProfit - depreciation;
  const nopat = ebit - Math.max(0, ebit) * MODEL_TAX_RATE;
  const roic = nopat / p.cost;
  const annualCashAfterTax = cashProfit - Math.max(0, ebit) * MODEL_TAX_RATE;
  return {
    revenue, cashProfit, depreciation, ebit, nopat, roic,
    spread: roic - p.wacc,
    revenuePerCapital: revenue / p.cost,
    payback: annualCashAfterTax > 0 ? p.cost / annualCashAfterTax : null,
    operatingMargin: revenue > 0 ? ebit / revenue : null,
    normalizedCash: annualCashAfterTax - depreciation,
  };
}

export type HistoricalPoint = {
  label: string; revenue: number | null; capex: number | null;
  ebitdaMargin: number | null; laggedProductivity: number | null;
  source: string;
};
function sum(values: (number | null)[]): number | null {
  return values.every((v): v is number => v !== null) ? values.reduce((a, b) => a + b, 0) : null;
}
export function historicalCapitalEfficiency(quarters: Quarter[]): HistoricalPoint[] {
  const ordered = [...quarters].sort((a,b) => a.periodEnd.localeCompare(b.periodEnd));
  return ordered.map((q,i) => {
    const current = ordered.slice(Math.max(0,i-3), i+1);
    const prior = ordered.slice(Math.max(0,i-7), Math.max(0,i-3));
    const rev = current.length === 4 ? sum(current.map(x=>x.revenue.value)) : null;
    const prevRev = prior.length === 4 ? sum(prior.map(x=>x.revenue.value)) : null;
    const prevCapex = prior.length === 4 ? sum(prior.map(x=>x.capex.value === null ? null : Math.abs(x.capex.value))) : null;
    return {
      label:q.label, revenue:q.revenue.value, capex:q.capex.value === null ? null : Math.abs(q.capex.value),
      ebitdaMargin:q.revenue.value !== null && q.revenue.value > 0 && q.adjustedEbitda.value !== null ? q.adjustedEbitda.value / q.revenue.value : null,
      laggedProductivity:rev !== null && prevRev !== null && prevCapex !== null && prevCapex > 0 ? (rev-prevRev)/prevCapex : null,
      source:q.revenue.source,
    };
  });
}

export function projectedCapitalEfficiency(name: CaseName) {
  const model = runCase(name);
  const funding = financingPanel(model);
  // Spend-based book-depreciation proxy: opening tax basis is used as a capital
  // proxy, not reported PP&E. New spend is treated as in service at period midpoint.
  // No accelerated tax depreciation is used for operating margin.
  const assets = [
    { start: 2026.75, cost: OPENING_CAPITAL_PROXY * COMPUTE_SHARE_OF_CAPEX, life: 4.5 },
    { start: 2026.75, cost: OPENING_CAPITAL_PROXY * (1-COMPUTE_SHARE_OF_CAPEX), life: FACILITY_ASSET_LIFE },
  ];
  const netAssets = (t:number) => assets.reduce((n,a)=>n + (t >= a.start ? a.cost * Math.max(0,1-(t-a.start)/a.life) : 0),0);
  let shares = model.bridge.shares;
  const rows = model.rows.map((r,i) => {
    const start = r.year === 2026 ? 2026.75 : r.year;
    const end = r.year + 1;
    const beginningAssets = netAssets(start);
    const mid = (start+end)/2;
    assets.push({start:mid,cost:r.computeCapex,life:COMPUTE_ASSET_LIFE},{start:mid,cost:r.facilityCapex,life:FACILITY_ASSET_LIFE});
    const depreciation = assets.reduce((n,a)=>n + a.cost/a.life * Math.max(0,Math.min(end,a.start+a.life)-Math.max(start,a.start)),0);
    const endingAssets = netAssets(end);
    const avgCapital = (beginningAssets+endingAssets)/2;
    const ebit = r.ebitda-r.sbc-r.sfc-depreciation;
    const nopat = ebit-Math.max(0,ebit)*MODEL_TAX_RATE;
    const f = funding.fundingRows[i];
    const priorShares = shares;
    shares += f.equityDraw / funding.price * 1e6;
    const avgShares = (priorShares+shares)/2;
    const fcfe = r.fcff-f.cashInterest-f.termLoanPrincipal-f.notePrincipal-f.abfAmort+f.abfDraw+f.corporateDraw;
    const prior = model.rows[i-1];
    // 2026 DCF row contains Q4 only; no FY2026 denominator is fabricated.
    const productivity = r.year >= 2028 && prior.growthCapex > 0 ? (r.revenue-prior.revenue)/prior.growthCapex : null;
    const roic = avgCapital > 0 ? nopat / avgCapital / (end-start) : null;
    return {year:r.year, revenue:r.revenue, growth:r.growthCapex, replacement:r.replacementCapex,
      capex:r.capexNet, depreciation, ebitdaMargin:r.ebitda/r.revenue, ebitMargin:ebit/r.revenue,
      productivity, roic, wacc:model.wacc, spread:roic === null ? null : roic-model.wacc,
      fcfe, fcfePerShare:fcfe*1e6/avgShares, shares, fcff:r.fcff};
  });
  return { rows:rows.filter(r=>r.year>=2027), payback:model.payback, wacc:model.wacc,
    utilization:model.inputs.util, annualRevenuePerMw:model.inputs.acv, modelShares:model.bridge.shares,
    fundingPrice:funding.price };
}
