import capital from "@/data/capital-structure.json";
import peersFile from "@/data/peers.json";

/**
 * Model 2.1.0. Guided 2026–2027 cash flows, then revenue capped by energized
 * megawatts times a labeled rate, then a terminal value on maintenance capex only.
 * Educational arithmetic, not a price target.
 */
export const MODEL_VERSION = "2.1.0";
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
    margin2027: 0.32,
    marginTerminal: 0.3,
    capex2027: 45000,
    mw2026: 600,
    adds: { 2027: 700, 2028: 700, 2029: 700, 2030: 700, 2031: 500, 2032: 0 },
    mwCap: 4000,
    rateLegacy: 8,
    rateNew: 12,
    serverPerMw: 35,
    coverage: 0.75,
    wacc: 0.12,
    terminalGrowth: 0.02,
    taxRate: 0.2,
    issuePrice: 100,
    headline: "none",
    summary:
      "2026 revenue at the guided low end and 2027 at $12 billion. Energized megawatts start at 600 and add 700 a year, stopping at 4 GW. New megawatts earn $12 million a year, below the disclosed new-deal floors. Margin fades to 30%. Capex and the funding rate are at the expensive end. Residual equity is issued at $100, not at the August 2026 reference price. The notes stay outstanding.",
  },
  base: {
    weight: 0.5,
    revenue2026: 3000,
    revenue2027: 12500,
    margin2026: 0.4,
    margin2027: 0.4,
    marginTerminal: 0.4,
    capex2027: 42500,
    mw2026: 800,
    adds: { 2027: 1000, 2028: 1000, 2029: 1000, 2030: 800, 2031: 400, 2032: 0 },
    mwCap: 5000,
    rateLegacy: 10,
    rateNew: 20,
    serverPerMw: 25,
    coverage: 0.8,
    wacc: 0.1,
    terminalGrowth: 0.03,
    taxRate: 0.15,
    issuePrice: REFERENCE_PRICE,
    headline: "none",
    summary:
      "2026 revenue at the low end the company says it expects. 2027 revenue and capex are midpoints. End-2026 energized power is 800 MW, the low end of the older connected-power guide, which the November 2026 letter did not restate. One gigawatt a year is added until the 5 GW contracted-power target is filled. New megawatts earn $20 million a year, the Q2 2026 new-deal floor, not the higher Q3 floor. Margin stays at the guided 40%. Coverage is 80%. Tax is 15%. The notes stay outstanding.",
  },
  bull: {
    weight: 0.25,
    revenue2026: 3400,
    revenue2027: 13000,
    margin2026: 0.4,
    margin2027: 0.45,
    marginTerminal: 0.48,
    capex2027: 40000,
    mw2026: 1000,
    adds: { 2027: 1200, 2028: 1200, 2029: 1200, 2030: 1000, 2031: 600, 2032: 0 },
    mwCap: 6000,
    rateLegacy: 12,
    rateNew: 25,
    serverPerMw: 20,
    coverage: 0.85,
    wacc: 0.09,
    terminalGrowth: 0.03,
    taxRate: 0.12,
    issuePrice: REFERENCE_PRICE,
    headline: "all",
    summary:
      "Top of the published 2026 and 2027 revenue ranges, low end of 2027 capex, and 85% coverage. Energized power starts at 1 GW and the fleet is allowed to reach 6 GW, 1 GW above the year-end 2026 contracted-power target. New megawatts earn $25 million a year, the Q3 2026 new-deal floor. Margin moves toward 48%, still under the 53.2% third-quarter AI-cloud margin. The notes are share-settled.",
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
      ebitda = revenue * marginFor(year);
      growth = Math.max(0, assumptions.capex2027 - depreciation);
      server += growth * SERVER_SHARE;
      infra += growth * (1 - SERVER_SHARE);
      const add = Math.min(assumptions.adds[year] ?? 0, Math.max(0, assumptions.mwCap - mw));
      cohorts.push({ mw: add, rate: assumptions.rateNew });
      mw += add;
    } else {
      const add = Math.min(assumptions.adds[year] ?? 0, Math.max(0, assumptions.mwCap - mw));
      revenue = cohorts.reduce((sum, cohort) => sum + cohort.mw * cohort.rate, 0) + add * 0.5 * assumptions.rateNew;
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

  const endRevenue = cohorts.reduce((sum, cohort) => sum + cohort.mw * cohort.rate, 0) * (1 + assumptions.terminalGrowth);
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
