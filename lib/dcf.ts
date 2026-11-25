import capital from "@/data/capital-structure.json";
import peersFile from "@/data/peers.json";

/**
 * Model 2.2.0. Guided 2026–2027 cash flows, then a fade toward energized
 * megawatts times a labeled rate, then maintenance-only terminal value.
 * Educational arithmetic, not a price target.
 */
export const MODEL_VERSION = "2.2.0";
export const VALUATION_DATE = "2026-11-24";
export const REFERENCE_PRICE = 223.9;

export type CaseName = "bear" | "base" | "bull";
export type ConvertMode = "none" | "all";

type Note = (typeof capital.notes)[number];

export function conversionShares(note: Note): number {
  return Math.round(note.originalOutstanding * 1000 * note.conversionRatePerThousand);
}

export const CONVERT_SHARES = capital.notes.reduce((sum, note) => sum + conversionShares(note), 0);
export const BASIC_ECONOMIC_SHARES =
  capital.shares.outstanding.value + capital.shares.prefundedWarrants.shares;
export const NOTE_COUPON = capital.notes.reduce(
  (sum, note) => sum + note.originalOutstanding * note.coupon,
  0,
);

const termLoan = capital.facilities.find((facility) => facility.id === "term-loan");
if (
  !termLoan ||
  termLoan.principalOutstanding == null ||
  termLoan.swappedSofr == null ||
  termLoan.margin == null ||
  termLoan.carrying == null
) {
  throw new Error("Term loan is missing fields used by the model");
}

export const TERM_COUPON = termLoan.principalOutstanding * (termLoan.swappedSofr + termLoan.margin);
export const TERM_CARRYING = termLoan.carrying;
export const CONVERT_CARRYING = capital.notes.reduce((sum, note) => sum + note.carrying, 0);
const OPENING_DEBT = capital.debtCarryingTotal.value;
const OPENING_CASH = capital.cash.unrestricted.value;
const SERVER_LIFE = 5;
const INFRA_LIFE = 15;
const SERVER_SHARE = 0.85;
const ANNUALIZED_Q3_DA = 354.7 * 4;
const SPENT = { revenue: 1962.1, ebitda: 831.5, capex: 15430.7 };

/**
 * Recognized recurring revenue per MW, estimated for September 30, 2026.
 * Recurring AI-cloud revenue was $648.7 million. Times four is $2,594.8 million.
 * Active power was about 170 MW at December 31, 2025. The connected-power guide
 * for December 31, 2026 was 800 MW to 1 GW, and the November 2026 letter did not
 * restate it. The estimate walks in a straight line from 170 MW to the 800 MW
 * low end over 2026. September 30 is day 273, so 170 + (273/365)×(800−170) = 641 MW.
 * 2,594.8 / 641 = $4.05 million per MW-year. New-deal contract value is higher.
 */
export const FLEET_RATE_PER_MW = 4.05;

export type ModelAssumptions = {
  revenue2026: number;
  revenue2027: number;
  margin2026: number;
  margin2027: number;
  marginTerminal: number;
  capex2027: number;
  /** Energized MW at the end of 2026. Not restated in the Q3 2026 letter. */
  mw2026: number;
  adds: Record<number, number>;
  mwCap: number;
  /** $ millions of revenue per MW-year on the end-2026 fleet. Estimate. */
  rateLegacy: number;
  /** $ millions of revenue per MW-year on MW energized after 2026. */
  rateNew: number;
  /**
   * Fraction of the gap between last year's revenue and the megawatt × rate ceiling
   * that is recognized the next year. One is an immediate jump to the ceiling.
   */
  fadeShare: number;
  /** Server capex per MW after 2027, $ millions. Shells are in the 2026–27 budget. */
  serverPerMw: number;
  coverage: number;
  wacc: number;
  terminalGrowth: number;
  /** Normalized cash tax rate after NOLs. Not a company guide. */
  taxRate: number;
  /** Price at which residual equity is assumed to be issued. */
  issuePrice: number;
  headline: ConvertMode;
  weight: number;
  summary: string;
};

export const CASES: Record<CaseName, ModelAssumptions> = {
  bear: {
    weight: 0.25,
    revenue2026: 3000,
    revenue2027: 12000,
    margin2026: 0.4,
    margin2027: 0.45,
    marginTerminal: 0.24,
    capex2027: 45000,
    mw2026: 600,
    adds: { 2027: 700, 2028: 700, 2029: 700, 2030: 700, 2031: 500, 2032: 0 },
    mwCap: 4000,
    rateLegacy: FLEET_RATE_PER_MW,
    rateNew: 12,
    fadeShare: 0.25,
    serverPerMw: 35,
    coverage: 0.75,
    wacc: 0.12,
    terminalGrowth: 0.02,
    taxRate: 0.2,
    issuePrice: REFERENCE_PRICE / 2,
    headline: "none",
    summary:
      "2026 revenue at the guided low end and 2027 at $12 billion. The 2027 margin is 45%, the Q1 2026 core print, and the terminal margin is 24%, the Q4 2025 core print. That is the bottom of the disclosed positive cloud-margin history, not a figure below it. Energized megawatts start at 600 and stop at 4 GW. The legacy fleet earns the $4.05 million run-rate estimate. New megawatts earn $12 million, below the disclosed deal floors, and each year recognizes 25% of the remaining gap up to the megawatt ceiling. Residual equity is issued at half the August 2026 reference price, $111.95. The notes stay outstanding.",
  },
  base: {
    weight: 0.5,
    revenue2026: 3000,
    revenue2027: 12500,
    margin2026: 0.4,
    margin2027: 0.532,
    marginTerminal: 0.49,
    capex2027: 42500,
    mw2026: 800,
    adds: { 2027: 1000, 2028: 1000, 2029: 1000, 2030: 800, 2031: 400, 2032: 0 },
    mwCap: 5000,
    rateLegacy: FLEET_RATE_PER_MW,
    rateNew: 20,
    fadeShare: 0.5,
    serverPerMw: 25,
    coverage: 0.8,
    wacc: 0.1,
    terminalGrowth: 0.03,
    taxRate: 0.15,
    issuePrice: REFERENCE_PRICE,
    headline: "none",
    summary:
      "2026 stays on the guided 40% group margin because nine months are already reported and the company guided the year at about 40%. From 2027 the margin is the Q3 2026 AI-cloud print of 53.2%, fading to 49% by 2032. The fade is four points for power cost and for the group businesses that still lose money, not a return to the older 40% guide. Legacy megawatts earn the $4.05 million run-rate estimate. New megawatts earn $20 million, the Q2 2026 deal floor, and are not priced at the Q3 floor. Each year recognizes half of the remaining gap up to the megawatt ceiling. The fleet stops at 5 GW. The notes stay outstanding.",
  },
  bull: {
    weight: 0.25,
    revenue2026: 3400,
    revenue2027: 13000,
    margin2026: 0.4,
    margin2027: 0.532,
    marginTerminal: 0.55,
    capex2027: 40000,
    mw2026: 1000,
    adds: { 2027: 1000, 2028: 1000, 2029: 1000, 2030: 1000, 2031: 0, 2032: 0 },
    mwCap: 5000,
    rateLegacy: FLEET_RATE_PER_MW,
    rateNew: 25,
    fadeShare: 0.3,
    serverPerMw: 20,
    coverage: 0.85,
    wacc: 0.09,
    terminalGrowth: 0.03,
    taxRate: 0.12,
    issuePrice: REFERENCE_PRICE,
    headline: "all",
    summary:
      "Top of the 2026 and 2027 revenue ranges, low end of 2027 capex, and 85% coverage. The fleet starts at 1 GW and stops at the 5 GW contracted-power target. Legacy megawatts stay on the $4.05 million run-rate estimate. Only new megawatts earn $25 million, the Q3 2026 floor, and each year recognizes 30% of the remaining gap up to that ceiling. That pace, not the 55% margin, is what keeps the case from jumping to the full contract-value ceiling inside the explicit window. The margin starts at the 53.2% print and is allowed up to 55%, not higher. The notes are share-settled.",
  },
};

export type ModelYear = {
  year: number;
  label: string;
  revenue: number;
  ebitda: number;
  depreciation: number;
  growthCapex: number;
  maintenanceCapex: number;
  fcff: number;
  yearsOut: number;
  pv: number;
  mw: number;
  equityRaised: number;
};

export type Bridge = {
  mode: ConvertMode;
  enterpriseValue: number;
  debt: number;
  cash: number;
  netDebt: number;
  equityFirm: number;
  shares: number;
  convertShares: number;
  equityRaiseShares: number;
  perShare: number;
  fundingGap: number;
};

export type ModelResult = {
  ok: true;
  version: typeof MODEL_VERSION;
  name: CaseName;
  assumptions: ModelAssumptions;
  years: ModelYear[];
  terminalMethod: "gordon" | "harvest";
  terminalFcff: number;
  terminalValue: number;
  pvTerminal: number;
  enterpriseValue: number;
  bridges: Record<ConvertMode, Bridge>;
  headline: ConvertMode;
  ebitda2027: number;
};

export type PeerImplied = {
  id: string;
  name: string;
  ticker: string;
  asOf: string;
  source: string;
  sourceTitle: string;
  definition: string;
  evToEbitda: number | null;
  evToRevenue: number | null;
  perShareOnEbitda: number | null;
  perShareOnRevenue: number | null;
  divergesFromDcf: boolean;
};

function yearsOut(year: number): number {
  const end = Date.parse(`${year}-12-31T00:00:00Z`);
  const start = Date.parse(`${VALUATION_DATE}T00:00:00Z`);
  return Math.round((end - start) / 86_400_000) / 365;
}

function afterTax(ebit: number, taxRate: number): number {
  return ebit > 0 ? ebit * (1 - taxRate) : ebit;
}

export function runCase(name: CaseName, overrides: Partial<ModelAssumptions> = {}): ModelResult {
  const assumptions = { ...CASES[name], ...overrides };
  if (!(assumptions.wacc > assumptions.terminalGrowth)) {
    throw new Error("WACC has to be above terminal growth.");
  }
  let server = ANNUALIZED_Q3_DA * SERVER_SHARE * SERVER_LIFE;
  let infra = ANNUALIZED_Q3_DA * (1 - SERVER_SHARE) * INFRA_LIFE;
  const cohorts: { mw: number; rate: number }[] = [{ mw: assumptions.mw2026, rate: assumptions.rateLegacy }];
  let mw = assumptions.mw2026;
  const depreciationNow = () => server / SERVER_LIFE + infra / INFRA_LIFE;
  const marginFor = (year: number) => {
    if (year <= 2026) return assumptions.margin2026;
    if (year === 2027) return assumptions.margin2027;
    const t = Math.min(1, (year - 2027) / 5);
    return assumptions.margin2027 + (assumptions.marginTerminal - assumptions.margin2027) * t;
  };

  const drafts: {
    year: number;
    revenue: number;
    ebitda: number;
    depreciation: number;
    growth: number;
    mw: number;
  }[] = [];
  let priorFullYear = assumptions.revenue2026;

  for (const year of [2026, 2027, 2028, 2029, 2030, 2031, 2032]) {
    const depreciation = depreciationNow();
    let revenue = 0;
    let ebitda = 0;
    let growth = 0;
    let da = depreciation;
    if (year === 2026) {
      revenue = assumptions.revenue2026 - SPENT.revenue;
      ebitda = assumptions.revenue2026 * assumptions.margin2026 - SPENT.ebitda;
      const total = 27000 - SPENT.capex;
      const stub = depreciation * (92 / 365);
      growth = Math.max(0, total - stub);
      da = stub;
      server += growth * SERVER_SHARE;
      infra += growth * (1 - SERVER_SHARE);
    } else if (year === 2027) {
      revenue = assumptions.revenue2027;
      priorFullYear = revenue;
      ebitda = revenue * marginFor(year);
      growth = Math.max(0, assumptions.capex2027 - depreciation);
      server += growth * SERVER_SHARE;
      infra += growth * (1 - SERVER_SHARE);
      const add = Math.min(assumptions.adds[year] ?? 0, Math.max(0, assumptions.mwCap - mw));
      cohorts.push({ mw: add, rate: assumptions.rateNew });
      mw += add;
    } else {
      const add = Math.min(assumptions.adds[year] ?? 0, Math.max(0, assumptions.mwCap - mw));
      const ceiling = cohorts.reduce((sum, cohort) => sum + cohort.mw * cohort.rate, 0) + add * 0.5 * assumptions.rateNew;
      const gap = Math.max(0, ceiling - priorFullYear);
      revenue = Math.min(ceiling, priorFullYear + assumptions.fadeShare * gap);
      priorFullYear = revenue;
      ebitda = revenue * marginFor(year);
      growth = add * assumptions.serverPerMw;
      server += growth;
      cohorts.push({ mw: add, rate: assumptions.rateNew });
      mw += add;
    }
    drafts.push({ year, revenue, ebitda, depreciation: da, growth, mw });
  }

  const interest0 = (assumptions.headline === "all" ? TERM_COUPON : NOTE_COUPON + TERM_COUPON);
  let cash = OPENING_CASH;
  let equityNeed = 0;
  let explicitPv = 0;
  const years: ModelYear[] = drafts.map((draft) => {
    const ebit = draft.ebitda - draft.depreciation;
    const fcffM = afterTax(ebit, assumptions.taxRate) - draft.growth;
    const out = yearsOut(draft.year);
    const pv = (fcffM * 1e6) / (1 + assumptions.wacc) ** out;
    explicitPv += pv;
    const taxCash = Math.max(ebit, 0) * assumptions.taxRate;
    const interest = interest0 * (draft.year === 2026 ? 92 / 365 : 1);
    const operating = draft.ebitda - taxCash - interest - draft.depreciation;
    const gap = draft.growth * (1 - assumptions.coverage) - Math.max(operating, 0);
    const use = Math.min(cash, Math.max(0, gap));
    cash -= use;
    const raised = Math.max(0, gap - use);
    equityNeed += raised;
    return {
      year: draft.year,
      label: draft.year === 2026 ? "2026 remainder" : String(draft.year),
      revenue: draft.revenue * 1e6,
      ebitda: draft.ebitda * 1e6,
      depreciation: draft.depreciation * 1e6,
      growthCapex: draft.growth * 1e6,
      maintenanceCapex: draft.depreciation * 1e6,
      fcff: fcffM * 1e6,
      yearsOut: out,
      pv,
      mw: draft.mw,
      equityRaised: raised * 1e6,
    };
  });

  const ceiling = cohorts.reduce((sum, cohort) => sum + cohort.mw * cohort.rate, 0);
  const lastRevenue = drafts[drafts.length - 1]?.revenue ?? 0;
  const endRevenue = Math.min(ceiling, lastRevenue) * (1 + assumptions.terminalGrowth);
  const endEbitda = endRevenue * assumptions.marginTerminal;
  const endDa = depreciationNow() * (1 + assumptions.terminalGrowth);
  const endEbit = endEbitda - endDa;
  let terminalMethod: "gordon" | "harvest";
  let terminalFcff: number;
  let terminalValueM: number;
  if (endEbit > 0) {
    terminalMethod = "gordon";
    terminalFcff = afterTax(endEbit, assumptions.taxRate) * 1e6;
    terminalValueM = terminalFcff / 1e6 / (assumptions.wacc - assumptions.terminalGrowth);
  } else {
    terminalMethod = "harvest";
    const exitEbitda = years[years.length - 1].ebitda / 1e6;
    const exitDa = depreciationNow();
    let value = 0;
    for (let t = 1; t <= SERVER_LIFE; t += 1) {
      const ebitdaT = (exitEbitda * (SERVER_LIFE + 1 - t)) / SERVER_LIFE;
      const daT = (exitDa * (SERVER_LIFE + 1 - t)) / SERVER_LIFE;
      const ebitT = ebitdaT - daT;
      const cashT = ebitT > 0 ? afterTax(ebitT, assumptions.taxRate) + daT : ebitdaT;
      value += cashT / (1 + assumptions.wacc) ** t;
    }
    terminalFcff = exitEbitda * 1e6;
    terminalValueM = value;
  }
  const pvTerminal = (terminalValueM * 1e6) / (1 + assumptions.wacc) ** yearsOut(2032);
  const enterpriseValue = explicitPv + pvTerminal;
  const equityRaiseShares = Math.round((equityNeed * 1e6) / assumptions.issuePrice);

  const bridgeFor = (mode: ConvertMode): Bridge => {
    const debt = (mode === "all" ? TERM_CARRYING : OPENING_DEBT) * 1e6;
    const cashLeft = cash * 1e6;
    const netDebt = debt - cashLeft;
    const equityFirm = enterpriseValue - netDebt;
    const convertShares = mode === "all" ? CONVERT_SHARES : 0;
    const shares = BASIC_ECONOMIC_SHARES + convertShares + equityRaiseShares;
    return {
      mode,
      enterpriseValue,
      debt,
      cash: cashLeft,
      netDebt,
      equityFirm,
      shares,
      convertShares,
      equityRaiseShares,
      perShare: equityFirm / shares,
      fundingGap: equityNeed * 1e6,
    };
  };

  return {
    ok: true,
    version: MODEL_VERSION,
    name,
    assumptions,
    years,
    terminalMethod,
    terminalFcff,
    terminalValue: terminalValueM * 1e6,
    pvTerminal,
    enterpriseValue,
    bridges: { none: bridgeFor("none"), all: bridgeFor("all") },
    headline: assumptions.headline,
    ebitda2027: years.find((row) => row.year === 2027)?.ebitda ?? 0,
  };
}

export function headlineValue(result: ModelResult): number {
  return result.bridges[result.headline].perShare;
}

export function allCases(): ModelResult[] {
  return (["bear", "base", "bull"] as const).map((caseName) => runCase(caseName));
}

export function weightedValue(results: ModelResult[] = allCases()): number {
  return results.reduce((sum, result) => sum + result.assumptions.weight * headlineValue(result), 0);
}

export function waccGrowthGrid(): { wacc: number; growth: number; perShare: number | null }[][] {
  const waccs = [0.08, 0.09, 0.1, 0.12];
  const growths = [0.02, 0.03, 0.04];
  return waccs.map((wacc) =>
    growths.map((terminalGrowth) => {
      if (wacc <= terminalGrowth) return { wacc, growth: terminalGrowth, perShare: null };
      return {
        wacc,
        growth: terminalGrowth,
        perShare: runCase("base", { wacc, terminalGrowth }).bridges.none.perShare,
      };
    }),
  );
}

/** Terminal value rebuilt at other margins. Maintenance stays the model's replacement cost. */
export function marginMaintenanceGrid(): { margin: number; maintenanceToRevenue: number; perShare: number }[][] {
  const margins = [0.3, 0.4, 0.48];
  const ratios = [0.08, 0.12, 0.2, 0.29];
  const base = runCase("base");
  const last = base.years[base.years.length - 1];
  const explicit = base.enterpriseValue - base.pvTerminal;
  return margins.map((margin) =>
    ratios.map((maintenanceToRevenue) => {
      const revenue = (last.revenue / 1e6) * (1 + CASES.base.terminalGrowth);
      const ebitda = revenue * margin;
      const maintenance = revenue * maintenanceToRevenue;
      const ebit = ebitda - maintenance;
      const wacc = CASES.base.wacc;
      const growth = CASES.base.terminalGrowth;
      const tax = CASES.base.taxRate;
      let terminalM = 0;
      if (ebit > 0) terminalM = (afterTax(ebit, tax)) / (wacc - growth);
      else {
        for (let t = 1; t <= SERVER_LIFE; t += 1) {
          const slice = (last.ebitda / 1e6) * ((SERVER_LIFE + 1 - t) / SERVER_LIFE);
          terminalM += slice / (1 + wacc) ** t;
        }
      }
      const pvTerminal = (terminalM * 1e6) / (1 + wacc) ** yearsOut(2032);
      const ev = explicit + pvTerminal;
      const perShare = (ev - base.bridges.none.netDebt) / base.bridges.none.shares;
      return { margin, maintenanceToRevenue, perShare };
    }),
  );
}

export function peerCrossCheck(result: ModelResult): PeerImplied[] {
  const ebitda = result.ebitda2027 / 1e6;
  const revenue = (result.years.find((row) => row.year === 2027)?.revenue ?? 0) / 1e6;
  const netDebt = (OPENING_DEBT - OPENING_CASH) * 1e6;
  const shares = result.bridges[result.headline].shares;
  const dcf = headlineValue(result);
  return peersFile.peers.map((peer) => {
    const fromMultiple = (multiple: number | null, base: number) => {
      if (multiple == null) return null;
      return (base * multiple * 1e6 - netDebt) / shares;
    };
    const onEbitda = fromMultiple(peer.evToEbitda, ebitda);
    const onRevenue = fromMultiple(peer.evToRevenue, revenue);
    const comparable = onEbitda ?? onRevenue;
    const diverges =
      comparable == null
        ? false
        : comparable === 0
          ? dcf !== 0
          : Math.abs(dcf - comparable) / Math.abs(comparable) > 0.5;
    return {
      id: peer.id,
      name: peer.name,
      ticker: peer.ticker,
      asOf: peer.asOf,
      source: peer.source,
      sourceTitle: peer.sourceTitle,
      definition: peer.definition,
      evToEbitda: peer.evToEbitda,
      evToRevenue: peer.evToRevenue,
      perShareOnEbitda: onEbitda,
      perShareOnRevenue: onRevenue,
      divergesFromDcf: diverges,
    };
  });
}
