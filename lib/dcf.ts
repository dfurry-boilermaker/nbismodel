import capital from "@/data/capital-structure.json";

/**
 * Model 2.0.0. Five years of free cash flow from the November 12, 2026 outlook,
 * a terminal value, and a per-share bridge. Educational arithmetic, not a price target.
 */
export const MODEL_VERSION = "2.0.0";
export const VALUATION_DATE = "2026-11-24";
export const ISSUE_PRICE = 223.9;

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

/** Cash coupon after the disclosed SOFR swap. Not the 7.60% effective rate, which includes fees. */
export const TERM_COUPON = termLoan.principalOutstanding * (termLoan.swappedSofr + termLoan.margin);
export const CONVERT_CARRYING = capital.notes.reduce((sum, note) => sum + note.carrying, 0);

export type ModelAssumptions = {
  revenue2027: number;
  growthAfter: number;
  margin2026: number;
  marginLater: number;
  capex2027: number;
  /** 2028, 2029, 2030 capex in $ millions. These years were not guided. */
  capexLater: [number, number, number];
  coverage: number;
  wacc: number;
  terminalGrowth: number;
  serverShare: number;
  serverLife: number;
  infraLife: number;
};

export const CASES: Record<CaseName, ModelAssumptions & { weight: number; summary: string }> = {
  bear: {
    weight: 0.25,
    revenue2027: 12000,
    growthAfter: 0.05,
    margin2026: 0.4,
    marginLater: 0.3,
    capex2027: 45000,
    capexLater: [25000, 25000, 20000],
    coverage: 0.75,
    wacc: 0.12,
    terminalGrowth: 0.02,
    serverShare: 0.85,
    serverLife: 5,
    infraLife: 15,
    summary:
      "2027 revenue at the low end of the outlook and capex at the high end. Margin after 2026 steps down to 30%. Capex stays heavy in 2028–2030, which was not guided. Coverage uses the low end of the 75–85% range. The notes stay outstanding.",
  },
  base: {
    weight: 0.5,
    revenue2027: 12500,
    growthAfter: 0.1,
    margin2026: 0.4,
    marginLater: 0.4,
    capex2027: 42500,
    capexLater: [15000, 12000, 10000],
    coverage: 0.8,
    wacc: 0.1,
    terminalGrowth: 0.03,
    serverShare: 0.85,
    serverLife: 5,
    infraLife: 15,
    summary:
      "2026 revenue at the low end the company says it now expects. 2027 revenue and capex are midpoints of the stated ranges. Margin stays at the guided 40%. Capex steps down after 2027 but does not fall to maintenance. Coverage is 80%, the midpoint of 75–85%. The headline keeps the notes as debt.",
  },
  bull: {
    weight: 0.25,
    revenue2027: 13000,
    growthAfter: 0.12,
    margin2026: 0.4,
    marginLater: 0.45,
    capex2027: 40000,
    capexLater: [8000, 6000, 5000],
    coverage: 0.85,
    wacc: 0.09,
    terminalGrowth: 0.03,
    serverShare: 0.85,
    serverLife: 5,
    infraLife: 15,
    summary:
      "Top of the 2027 revenue range, low end of 2027 capex, and 85% coverage. Margin after 2026 is 45%, between the 40% group guide and the 53.2% third-quarter AI-cloud margin. Later capex is an assumption well below the build years. It is not the company's 'more than 1 GW a year' statement. The headline share-settles the notes.",
  },
};

const SPENT = { revenue: 1962.1, ebitda: 831.5, capex: 15430.7 };
const FY2026_REVENUE = 3000;
const FY2026_CAPEX = 27000;

export type ModelYear = {
  year: number;
  label: string;
  revenue: number;
  ebitda: number;
  depreciation: number;
  capex: number;
  covered: number;
  cashInterest: number;
  pretax: number;
  fcff: number;
  yearsOut: number;
  pv: number;
};

export type Bridge = {
  mode: ConvertMode;
  enterpriseValue: number;
  debt: number;
  cash: number;
  restrictedCash: number;
  netDebt: number;
  equityFirm: number;
  shares: number;
  convertShares: number;
  perShare: number;
  /** Capex not covered by EBITDA or the stated prepay/asset-backed coverage, after unrestricted cash. */
  fundingGap: number;
  /** Shares that would be issued if the gap cleared at the August 2026 reference price. Zero when that price is above the model value. */
  equityRaiseShares: number;
  fundingNote: string;
};

export type ModelResult = {
  ok: true;
  version: typeof MODEL_VERSION;
  name: CaseName;
  assumptions: ModelAssumptions;
  years: ModelYear[];
  terminalMethod: "gordon" | "runoff";
  terminalFcff: number;
  terminalValue: number;
  pvTerminal: number;
  enterpriseValue: number;
  bridges: Record<ConvertMode, Bridge>;
  headline: ConvertMode;
};

function daysBetween(start: string, end: string): number {
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000);
}

function openingGross(serverShare: number, serverLife: number, infraLife: number) {
  const annualDa = 354.7 * 4;
  return {
    server: annualDa * serverShare * serverLife,
    infra: annualDa * (1 - serverShare) * infraLife,
  };
}

export function runCase(name: CaseName, overrides: Partial<ModelAssumptions> = {}): ModelResult {
  const assumptions = { ...CASES[name], ...overrides };
  if (!(assumptions.wacc > assumptions.terminalGrowth)) {
    throw new Error("WACC has to be above terminal growth.");
  }
  if (assumptions.serverShare < 0 || assumptions.serverShare > 1) {
    throw new Error("Server share has to be between 0 and 1.");
  }

  const gross0 = openingGross(assumptions.serverShare, assumptions.serverLife, assumptions.infraLife);
  let serverGross = gross0.server;
  let infraGross = gross0.infra;
  let serverCip = 0;
  let infraCip = 0;
  const depreciate = (capex: number) => {
    const server = capex * assumptions.serverShare;
    const infra = capex * (1 - assumptions.serverShare);
    const placeServer = server * 0.5 + serverCip;
    serverCip = server * 0.5;
    const placeInfra = infraCip;
    infraCip = infra;
    serverGross += placeServer;
    infraGross += placeInfra;
    return serverGross / assumptions.serverLife + infraGross / assumptions.infraLife;
  };

  const q4Revenue = FY2026_REVENUE - SPENT.revenue;
  const q4Ebitda = FY2026_REVENUE * assumptions.margin2026 - SPENT.ebitda;
  const q4Capex = FY2026_CAPEX - SPENT.capex;
  const revenues = [assumptions.revenue2027];
  for (let i = 1; i < 4; i += 1) revenues.push(revenues[i - 1] * (1 + assumptions.growthAfter));
  const capexes = [q4Capex, assumptions.capex2027, ...assumptions.capexLater];
  const revenueRows = [q4Revenue, ...revenues];
  const labels = ["2026 remainder", "2027", "2028", "2029", "2030"];

  const years: ModelYear[] = revenueRows.map((revenue, index) => {
    const year = 2026 + index;
    const margin = index === 0 ? assumptions.margin2026 : assumptions.marginLater;
    const ebitda = index === 0 ? q4Ebitda : revenue * margin;
    const capex = capexes[index];
    const depreciation = depreciate(capex);
    const covered = index === 1 ? assumptions.coverage * capex : 0;
    const fcff = (ebitda - capex) * 1e6;
    const yearsOut = daysBetween(VALUATION_DATE, `${year}-12-31`) / 365;
    const pv = fcff / (1 + assumptions.wacc) ** yearsOut;
    return {
      year,
      label: labels[index],
      revenue: revenue * 1e6,
      ebitda: ebitda * 1e6,
      depreciation: depreciation * 1e6,
      capex: capex * 1e6,
      covered: covered * 1e6,
      cashInterest: 0,
      pretax: 0,
      fcff,
      yearsOut,
      pv,
    };
  });

  const maintenance =
    (serverGross / assumptions.serverLife + infraGross / assumptions.infraLife) *
    (1 + assumptions.terminalGrowth);
  const exitEbitda = (years[years.length - 1].ebitda / 1e6) * (1 + assumptions.terminalGrowth);
  const maintenanceFcff = exitEbitda - maintenance;
  const lastOut = years[years.length - 1].yearsOut;
  let terminalMethod: "gordon" | "runoff";
  let terminalFcff: number;
  let terminalValue: number;
  if (maintenanceFcff > 0) {
    terminalMethod = "gordon";
    terminalFcff = maintenanceFcff * 1e6;
    terminalValue = terminalFcff / (assumptions.wacc - assumptions.terminalGrowth);
  } else {
    terminalMethod = "runoff";
    const life = assumptions.serverLife;
    let valueAt2030 = 0;
    const exit = years[years.length - 1].ebitda;
    for (let t = 1; t <= life; t += 1) {
      const cash = (exit * (life - t + 1)) / life;
      valueAt2030 += cash / (1 + assumptions.wacc) ** t;
    }
    terminalFcff = exit;
    terminalValue = valueAt2030;
  }
  const pvTerminal = terminalValue / (1 + assumptions.wacc) ** lastOut;
  const enterpriseValue = years.reduce((sum, row) => sum + row.pv, 0) + pvTerminal;

  const cash = capital.cash.unrestricted.value * 1e6;
  const restricted = capital.cash.restricted.value * 1e6;
  const gapDollars =
    years.reduce((sum, row) => sum + Math.max(0, row.capex - row.ebitda - row.covered), 0) - cash;

  const applyInterest = (mode: ConvertMode) => {
    const interest = (mode === "all" ? TERM_COUPON : NOTE_COUPON + TERM_COUPON) * 1e6;
    years.forEach((row, index) => {
      const fraction = index === 0 ? 92 / 365 : 1;
      row.cashInterest = interest * fraction;
      row.pretax = row.ebitda - row.depreciation - row.cashInterest;
    });
  };

  const bridgeFor = (mode: ConvertMode): Bridge => {
    const debt =
      (mode === "all"
        ? capital.debtCarryingTotal.value - CONVERT_CARRYING
        : capital.debtCarryingTotal.value) * 1e6;
    const netDebt = debt - cash;
    const equityFirm = enterpriseValue - netDebt;
    const convertShares = mode === "all" ? CONVERT_SHARES : 0;
    const sharesNow = BASIC_ECONOMIC_SHARES + convertShares;
    const perShareNow = equityFirm / sharesNow;
    let equityRaiseShares = 0;
    let fundingNote =
      "The residual is the capex still to fund after EBITDA, unrestricted cash, and the 2027 coverage rate. It is already inside free cash flow as capex, so it is not subtracted again.";
    if (gapDollars > 0 && perShareNow > ISSUE_PRICE) {
      equityRaiseShares = Math.round(gapDollars / ISSUE_PRICE);
      fundingNote = `The residual would clear at the August 2026 reference price of $${ISSUE_PRICE.toFixed(2)}, which is below this case's per-share arithmetic, so those shares are added.`;
    } else if (gapDollars > 0) {
      fundingNote =
        "The residual does not clear at the August 2026 reference price of $223.90, because that price is above this case's per-share arithmetic. No shares are added. The capex remains in free cash flow.";
    }
    const shares = sharesNow + equityRaiseShares;
    return {
      mode,
      enterpriseValue,
      debt,
      cash,
      restrictedCash: restricted,
      netDebt,
      equityFirm,
      shares,
      convertShares,
      perShare: equityFirm / shares,
      fundingGap: Math.max(0, gapDollars),
      equityRaiseShares,
      fundingNote,
    };
  };

  const headline: ConvertMode = name === "bull" ? "all" : "none";
  const bridges = { none: bridgeFor("none"), all: bridgeFor("all") };
  applyInterest(headline);
  return {
    ok: true,
    version: MODEL_VERSION,
    name,
    assumptions,
    years,
    terminalMethod,
    terminalFcff,
    terminalValue,
    pvTerminal,
    enterpriseValue,
    bridges,
    headline,
  };
}

export function headlineValue(result: ModelResult): number {
  return result.bridges[result.headline].perShare;
}

export function allCases(): ModelResult[] {
  return (["bear", "base", "bull"] as const).map((name) => runCase(name));
}

export function weightedValue(results: ModelResult[] = allCases()): number {
  return results.reduce((sum, result) => sum + CASES[result.name].weight * headlineValue(result), 0);
}

export function waccGrowthGrid(name: CaseName = "base"): { wacc: number; growth: number; perShare: number | null }[][] {
  const waccs = [0.08, 0.1, 0.12, 0.14];
  const growths = [0.02, 0.03, 0.04];
  return waccs.map((wacc) =>
    growths.map((terminalGrowth) => {
      if (wacc <= terminalGrowth) return { wacc, growth: terminalGrowth, perShare: null };
      return { wacc, growth: terminalGrowth, perShare: runCase(name, { wacc, terminalGrowth }).bridges.none.perShare };
    }),
  );
}

export function assumptionSensitivity(): { label: string; perShare: number; fundingGap: number }[] {
  const row = (label: string, name: CaseName, overrides: Partial<ModelAssumptions> = {}, mode: ConvertMode = "none") => {
    const result = runCase(name, overrides);
    return { label, perShare: result.bridges[mode].perShare, fundingGap: result.bridges[mode].fundingGap };
  };
  return [
    row("Base, notes outstanding", "base"),
    row("Base, all notes share-settled", "base", {}, "all"),
    row("Server-and-network share 70%", "base", { serverShare: 0.7 }),
    row("Server-and-network share 100%", "base", { serverShare: 1 }),
    row("2027 coverage 75%", "base", { coverage: 0.75 }),
    row("2027 coverage 85%", "base", { coverage: 0.85 }),
    row("2028–2030 capex cut to $4 billion a year", "base", { capexLater: [4000, 4000, 4000] }),
  ];
}
