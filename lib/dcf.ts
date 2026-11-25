import capital from "@/data/capital-structure.json";
import peersFile from "@/data/peers.json";

/**
 * Model 3.0.0. Educational arithmetic, not a price target.
 * Inputs are disclosed figures or labeled assumptions. Nothing is set to land near a peer multiple.
 */
export const MODEL_VERSION = "3.0.0";
export const VALUATION_DATE = "2026-11-24";

/** Close on the valuation date. Yahoo Finance, StockAnalysis (S&P Global), and FinancialContent all print $87.31. */
export const MARKET_PRICE = 87.31;
export const MARKET_PRICE_SOURCE =
  "Yahoo Finance, StockAnalysis (S&P Global Market Intelligence), and FinancialContent, NBIS close on November 24, 2026.";

/** Netherlands statutory rate above €200,000. https://www.belastingdienst.nl */
export const TAX_RATE = 0.258;
/** Steady-state stock-based pay as a share of revenue. The nine-month cash figure is not in the extracted statements. */
export const SBC_RATE = 0.02;
/** Term-loan hedged coupon: swapped SOFR 3.9% plus the 2.50% margin. Q3 2026 financial statements. */
export const SECURED_COUPON = 0.039 + 0.025;
export const SERVER_LIFE = 5;
export const SHELL_LIFE = 15;
/** Undisclosed. The guidance file already flags 85% as an estimate. */
export const SERVER_SHARE = 0.85;
export const DISCLOSED_ACTIVE_MW = 170;
export const RECURRING_RUN_RATE = 648.7 * 4;
export const RATE_ON_DISCLOSED_ACTIVE = RECURRING_RUN_RATE / DISCLOSED_ACTIVE_MW;
export const Q2_ACV_FLOOR = 20;
export const Q3_ACV_FLOOR = 25;
/** Payback on comparable 1–3 year deals, Q3 2026 shareholder letter. Covers opex and capex, revenue basis. */
export const DISCLOSED_PAYBACK_MONTHS = 19;
export const OPENING_DA = 354.7 * 4;
const SPENT = { revenue: 1962.1, ebitda: 831.5, capex: 15430.7 };
const CAPEX_2026 = 27000;
const DEFERRED_CURRENT = capital.deferredRevenue.current.value;
const DEFERRED_LONG = capital.deferredRevenue.nonCurrent.value;
export const DEFERRED_REVENUE = DEFERRED_CURRENT + DEFERRED_LONG;
/** December 31, 2025 carrying amounts plus the nine-month 2026 revaluation gain on equity securities. */
export const STAKES =
  737.1 + 780.6 + 97.0 + 4.7;
/** Share-based awards excluded as anti-dilutive in the Q3 2026 EPS footnote. Treated as shares. */
export const AWARD_SHARES = 9_736_161;

const termLoan = capital.facilities.find((facility) => facility.id === "term-loan");
if (!termLoan || termLoan.principalOutstanding == null) throw new Error("Term loan missing");

export type CaseName = "bear" | "base" | "bull";
type Note = (typeof capital.notes)[number];

export function conversionShares(note: Note): number {
  return Math.round(note.originalOutstanding * 1000 * note.conversionRatePerThousand);
}

export const CONVERT_SHARES = capital.notes.reduce((sum, note) => sum + conversionShares(note), 0);
export const BASIC_ECONOMIC_SHARES =
  capital.shares.outstanding.value + capital.shares.prefundedWarrants.shares;

const NOTES = capital.notes.map((note) => ({
  id: note.id,
  principal: note.maturityPrincipal,
  coupon: note.originalOutstanding * note.coupon,
  conversionPrice: note.conversionPrice,
  shares: conversionShares(note),
  maturityYear: Number(note.maturity.slice(0, 4)),
}));

export function floorShare(value: number): number {
  return Math.max(0, value);
}

type Cohort = {
  id: string;
  mw: number;
  startYear: number;
  rate: number;
  repriceYear: number;
  firstFraction: number;
  idleUntil?: number;
  reletFactor: number;
};

export type ModelAssumptions = {
  revenue2026: number;
  revenue2027: number;
  /** Margin from 2027. 2026 uses the guided 40% group margin. */
  margin: number;
  capex2027: number;
  coverage: number;
  discount: number;
  terminalGrowth: number;
  /** Annual decline in server dollars per MW. The same rate cuts the price at the next re-pricing. Baseline is zero. */
  costDecline: number;
  rateNew: number;
  mwCap: number;
  weight: number;
  terminateSlippedNj: boolean;
  issuePrice: number;
  summary: string;
};

const shellPerMw = ((42500 / 1000) * (1 - SERVER_SHARE));
const serverPerMw = (42500 / 1000) * SERVER_SHARE;

export const ALL_IN_PER_MW = serverPerMw + shellPerMw;

export const CASES: Record<CaseName, ModelAssumptions> = {
  bear: {
    weight: 0.3,
    revenue2026: 3000,
    revenue2027: 12000,
    margin: 0.4,
    capex2027: 45000,
    coverage: 0.75,
    discount: 0.12,
    terminalGrowth: 0.02,
    costDecline: 0,
    rateNew: 15,
    mwCap: 3000,
    terminateSlippedNj: true,
    issuePrice: MARKET_PRICE,
    summary:
      "2026 and 2027 revenue stay at the low end of the company's ranges. The margin is 40%, the full-year 2026 group guide. New megawatts are priced at $15 million, a quarter under the second-quarter deal floor. Energized power starts from the 170 MW year-end 2025 census plus the New Jersey capacity the letter still expects in 2026. The slipped New Jersey remainder is treated as terminated for late delivery, left idle through 2027, and re-let in 2028 at three quarters of the $15 million rate. The fleet stops at 3 GW. Cash flows are discounted at 12%. New shares, if any, are issued at the November 24, 2026 close.",
  },
  base: {
    weight: 0.5,
    revenue2026: 3000,
    revenue2027: 12500,
    margin: 0.4,
    capex2027: 42500,
    coverage: 0.8,
    discount: 0.11,
    terminalGrowth: 0.02,
    costDecline: 0,
    rateNew: Q2_ACV_FLOOR,
    mwCap: 5000,
    terminateSlippedNj: false,
    issuePrice: MARKET_PRICE,
    summary:
      "2026 revenue is the low end of the $3.0–3.4 billion letter range. 2027 revenue is the midpoint of the $12–13 billion outlook. The margin stays at the 40% group guide. The 53.2% third-quarter cloud margin is not used: that print includes about $325 million of non-recurring partnership revenue, and the margin on that revenue was not disclosed. New megawatts earn the $20 million second-quarter deal floor. Year-end 2026 power uses the 800 MW low end of the connected-power guide, which the third-quarter letter did not restate. The slipped New Jersey remainder arrives in the second quarter of 2027. Cash flows are discounted at 11%.",
  },
  bull: {
    weight: 0.2,
    revenue2026: 3400,
    revenue2027: 13000,
    margin: 0.5,
    capex2027: 40000,
    coverage: 0.85,
    discount: 0.11,
    terminalGrowth: 0.02,
    costDecline: 0,
    rateNew: Q3_ACV_FLOOR,
    mwCap: 5000,
    terminateSlippedNj: false,
    issuePrice: MARKET_PRICE,
    summary:
      "2026 revenue is the top of the letter range, $3.4 billion. A narrower $3.0–3.2 billion call range is not used: no call transcript was on EDGAR through the valuation date. 2027 revenue is the top of the $12–13 billion outlook. The margin is 50%, the second-quarter 2026 AI-cloud margin, and it is not set above a print. New megawatts earn the $25 million third-quarter floor. Year-end 2026 power uses the 1 GW high end of the connected guide. The New Jersey remainder still slips to the second quarter of 2027, because that timing is in the letter. The fleet stops at 5 GW. The discount rate is 11%, the same as the base.",
  },
};

function cohortsFor(name: CaseName, assumptions: ModelAssumptions): Cohort[] {
  const rate = assumptions.rateNew;
  const legacy: Cohort = {
    id: "legacy-170",
    mw: DISCLOSED_ACTIVE_MW,
    startYear: 2025,
    rate: RATE_ON_DISCLOSED_ACTIVE,
    repriceYear: 2028,
    firstFraction: 1,
    reletFactor: 1,
  };
  const njNow: Cohort = {
    id: "nj-2026",
    mw: 100,
    startYear: 2026,
    rate,
    repriceYear: 2031,
    firstFraction: 0.5,
    reletFactor: 1,
  };
  const njSlip: Cohort = {
    id: "nj-slip",
    mw: 100,
    startYear: 2027,
    rate,
    repriceYear: 2031,
    firstFraction: assumptions.terminateSlippedNj ? 0.5 : 0.75,
    idleUntil: assumptions.terminateSlippedNj ? 2028 : undefined,
    reletFactor: assumptions.terminateSlippedNj ? 0.75 : 1,
  };
  const meta: Cohort = {
    id: "meta-2027",
    mw: 120,
    startYear: 2027,
    rate,
    repriceYear: 2032,
    firstFraction: 0.5,
    reletFactor: 1,
  };
  const other = (id: string, mw: number, year: number, reprice: number): Cohort => ({
    id,
    mw,
    startYear: year,
    rate,
    repriceYear: reprice,
    firstFraction: 0.5,
    reletFactor: 1,
  });
  if (name === "bear") {
    return [
      legacy,
      njNow,
      njSlip,
      meta,
      other("y2027", 380, 2027, 2032),
      other("y2028", 500, 2028, 2033),
      other("y2029", 500, 2029, 2034),
      other("y2030", 500, 2030, 2035),
      other("y2031", 130, 2031, 2036),
    ];
  }
  if (name === "base") {
    return [
      legacy,
      njNow,
      other("y2026", 530, 2026, 2031),
      njSlip,
      meta,
      other("y2027", 780, 2027, 2032),
      other("y2028", 1000, 2028, 2033),
      other("y2029", 1000, 2029, 2034),
      other("y2030", 800, 2030, 2035),
      other("y2031", 400, 2031, 2036),
    ];
  }
  return [
    legacy,
    njNow,
    other("y2026", 730, 2026, 2031),
    njSlip,
    meta,
    other("y2027", 780, 2027, 2032),
    other("y2028", 1000, 2028, 2033),
    other("y2029", 1000, 2029, 2034),
    other("y2030", 1000, 2030, 2035),
  ];
}

function unitServer(year: number, decline: number): number {
  return serverPerMw * (1 - decline) ** Math.max(0, year - 2027);
}

function cohortPrice(cohort: Cohort, year: number, decline: number, rateNew: number): number {
  const relet = cohort.idleUntil != null ? cohort.reletFactor : 1;
  if (year >= cohort.repriceYear) {
    return rateNew * (1 - decline) ** Math.max(0, cohort.repriceYear - 2027) * relet;
  }
  return cohort.rate * relet;
}

function billing(cohorts: Cohort[], year: number, decline: number, rateNew: number): { revenue: number; mw: number } {
  let revenue = 0;
  let mw = 0;
  for (const cohort of cohorts) {
    if (year < cohort.startYear) continue;
    mw += cohort.mw;
    const first = cohort.idleUntil ?? cohort.startYear;
    if (year < first) continue;
    const fraction = year === first ? cohort.firstFraction : 1;
    revenue += cohort.mw * fraction * cohortPrice(cohort, year, decline, rateNew);
  }
  return { revenue, mw };
}

function deferredDraw(year: number): number {
  if (year === 2026) return DEFERRED_CURRENT / 4;
  if (year === 2027) return (DEFERRED_CURRENT * 3) / 4;
  if (year >= 2028 && year <= 2031) return DEFERRED_LONG / 4;
  return 0;
}

export function hardwarePaybackMonths(server: number, rate: number, margin: number): number {
  const ebitdaPerMw = rate * margin * (1 - SBC_RATE);
  if (ebitdaPerMw <= 0) return Number.POSITIVE_INFINITY;
  return (12 * server) / ebitdaPerMw;
}

type Loan = { balance: number; yearsLeft: number };

function payLoans(loans: Loan[]): number {
  let paid = 0;
  for (const loan of loans) {
    if (loan.balance <= 0 || loan.yearsLeft <= 0) continue;
    const principal = loan.balance / loan.yearsLeft;
    loan.balance -= principal;
    loan.yearsLeft -= 1;
    paid += principal;
  }
  return paid;
}

export type ModelYear = {
  year: number;
  label: string;
  mw: number;
  revenue: number;
  ebitda: number;
  depreciation: number;
  growthCapex: number;
  maintenanceCapex: number;
  interest: number;
  fcff: number;
  pv: number;
  debt: number;
  cash: number;
  shares: number;
};

export type Bridge = {
  mode: "settled";
  enterpriseValue: number;
  debt: number;
  cash: number;
  netDebt: number;
  equityFirm: number;
  shares: number;
  convertShares: number;
  equityRaiseShares: number;
  perShareRaw: number;
  perShare: number;
  fundingGap: number;
  stakes: number;
};

export type ModelResult = {
  ok: true;
  version: typeof MODEL_VERSION;
  name: CaseName;
  assumptions: ModelAssumptions;
  years: ModelYear[];
  terminalMethod: "gordon" | "none";
  terminalFcff: number;
  terminalValue: number;
  pvTerminal: number;
  enterpriseValue: number;
  tvShareOfEv: number | null;
  bridges: { none: Bridge; all: Bridge };
  headline: "settled";
  ebitda2027: number;
  netDebt2027: number;
  paybackMonths: number;
  hardwarePaybackMonths: number;
  floorBinds: boolean;
  convertedNoteIds: string[];
  equityIssued: number;
  interestTotal: number;
  deferredDrawn: number;
  engineRevenue2028: number;
};

function yearsOut(year: number): number {
  const stub = 37 / 365;
  return year - 2026 + stub;
}

function project(name: CaseName, assumptions: ModelAssumptions, converted: Set<string>): Omit<ModelResult, "ok" | "version" | "headline" | "bridges"> & { bridge: Bridge } {
  const cohorts = cohortsFor(name, assumptions);
  const decline = assumptions.costDecline;
  const loans: Loan[] = [{ balance: termLoan!.principalOutstanding!, yearsLeft: 4 }];
  let noteDebt = NOTES.filter((note) => !converted.has(note.id)).reduce((sum, note) => sum + note.principal, 0);
  let cash = capital.cash.unrestricted.value;
  let shares = BASIC_ECONOMIC_SHARES + AWARD_SHARES + NOTES.filter((note) => converted.has(note.id)).reduce((sum, note) => sum + note.shares, 0);
  let issued = 0;
  let nol = 0;
  let interestTotal = 0;
  let deferredDrawn = 0;
  const taxLots: { annual: number; left: number }[] = [{ annual: OPENING_DA, left: SERVER_LIFE }];
  const years: ModelYear[] = [];
  let engineRevenue2028 = 0;

  const addLot = (amount: number, life: number) => {
    if (amount > 0) taxLots.push({ annual: amount / life, left: life });
  };

  for (let year = 2026; year <= 2032; year += 1) {
    const engine = billing(cohorts, year, decline, assumptions.rateNew);
    if (year === 2028) engineRevenue2028 = engine.revenue;
    const margin = year === 2026 ? 0.4 : assumptions.margin;
    let revenue = engine.revenue;
    let ebitda = revenue * margin * (1 - SBC_RATE);
    if (year === 2026) {
      revenue = assumptions.revenue2026 - SPENT.revenue;
      const fullYearEbitda = assumptions.revenue2026 * margin - SPENT.ebitda;
      ebitda = fullYearEbitda - revenue * SBC_RATE;
    } else if (year === 2027) {
      revenue = assumptions.revenue2027;
      ebitda = revenue * margin * (1 - SBC_RATE);
    }
    const draw = deferredDraw(year);
    deferredDrawn += draw;
    const priorMw = year === 2026 ? DISCLOSED_ACTIVE_MW : billing(cohorts, year - 1, decline, assumptions.rateNew).mw;
    let growth = 0;
    let maintenance = 0;
    if (year === 2026) growth = CAPEX_2026 - SPENT.capex;
    else if (year === 2027) growth = assumptions.capex2027;
    else {
      const added = cohorts.filter((cohort) => cohort.startYear === year).reduce((sum, cohort) => sum + cohort.mw, 0);
      const server = unitServer(year, decline);
      growth = added * (server + shellPerMw);
      // Bear: capex for the planned build is spent even when energization slips.
      // Megawatts that miss the date are not in the billing fleet.
      if (name === "bear") {
        const planned = year === 2028 || year === 2029 ? 1000 : year === 2030 ? 800 : added;
        growth = Math.max(growth, planned * (server + shellPerMw));
      }
      maintenance = (priorMw / SERVER_LIFE) * server + (priorMw / SHELL_LIFE) * shellPerMw;
    }
    addLot((growth + maintenance) * SERVER_SHARE, SERVER_LIFE);
    addLot((growth + maintenance) * (1 - SERVER_SHARE), SHELL_LIFE);
    const depreciation = taxLots.reduce((sum, lot) => sum + (lot.left > 0 ? lot.annual : 0), 0);
    for (const lot of taxLots) if (lot.left > 0) lot.left -= 1;

    const coupon = NOTES.filter((note) => !converted.has(note.id)).reduce((sum, note) => sum + note.coupon, 0);
    const newDraw = assumptions.coverage * growth;
    const securedBalance = loans.reduce((sum, loan) => sum + loan.balance, 0);
    const interestPlain =
      (securedBalance * SECURED_COUPON + coupon + newDraw * SECURED_COUPON * 0.5) * (year === 2026 ? 37 / 365 : 1);
    interestTotal += interestPlain;

    const taxable = ebitda - depreciation - interestPlain;
    let tax = 0;
    if (taxable < 0) nol += -taxable;
    else {
      const used = Math.min(nol, taxable);
      nol -= used;
      tax = TAX_RATE * (taxable - used);
    }

    let principal = year === 2026 ? 0 : payLoans(loans);
    const matured = NOTES.filter((note) => !converted.has(note.id) && note.maturityYear === year);
    const maturityPay = matured.reduce((sum, note) => sum + note.principal, 0);
    noteDebt -= maturityPay;
    principal += maturityPay;

    loans.push({ balance: newDraw, yearsLeft: SERVER_LIFE });
    const cashFlow = ebitda - draw - tax - growth - maintenance - interestPlain + newDraw - principal;
    let raised = 0;
    cash += cashFlow;
    if (cash < 0) {
      raised = -cash;
      issued += raised;
      shares += (raised * 1e6) / assumptions.issuePrice;
      cash = 0;
    }

    const t = yearsOut(year);
    years.push({
      year,
      label: year === 2026 ? "2026 Q4" : String(year),
      mw: engine.mw,
      revenue: revenue * 1e6,
      ebitda: ebitda * 1e6,
      depreciation: depreciation * 1e6,
      growthCapex: growth * 1e6,
      maintenanceCapex: maintenance * 1e6,
      interest: interestPlain * 1e6,
      fcff: cashFlow * 1e6,
      pv: (cashFlow * 1e6) / (1 + assumptions.discount) ** t,
      debt: (noteDebt + loans.reduce((sum, loan) => sum + loan.balance, 0)) * 1e6,
      cash: cash * 1e6,
      shares,
    });
  }

  let terminalRevenue = 0;
  let terminalMw = 0;
  for (const cohort of cohorts) {
    if (2032 < cohort.startYear) continue;
    terminalMw += cohort.mw;
    const first = cohort.idleUntil ?? cohort.startYear;
    if (2032 < first) continue;
    terminalRevenue += cohort.mw * cohortPrice(cohort, 2032, decline, assumptions.rateNew);
  }
  const terminalEbitda = terminalRevenue * assumptions.margin * (1 - SBC_RATE);
  const terminalMaint =
    (terminalMw / SERVER_LIFE) * unitServer(2032, decline) + (terminalMw / SHELL_LIFE) * shellPerMw;
  const nopat = (terminalEbitda - terminalMaint) * (1 - TAX_RATE);
  const r = assumptions.discount;
  const g = assumptions.terminalGrowth;
  const roic = r;
  const fcff1 = nopat > 0 ? nopat * (1 + g) * (1 - g / roic) : 0;
  const terminalValueM = fcff1 > 0 && r > g ? fcff1 / (r - g) : 0;
  const endDebt = noteDebt + loans.reduce((sum, loan) => sum + loan.balance, 0);
  const equityTerminalM = terminalValueM - endDebt + cash;
  const t2032 = yearsOut(2032);
  const pvEquity = (equityTerminalM * 1e6) / (1 + r) ** t2032 + STAKES * 1e6;
  const pvTerminal = (terminalValueM * 1e6) / (1 + r) ** t2032;
  const perShareRaw = pvEquity / shares;
  const bridge: Bridge = {
    mode: "settled",
    enterpriseValue: pvTerminal,
    debt: endDebt * 1e6,
    cash: cash * 1e6,
    netDebt: (endDebt - cash) * 1e6,
    equityFirm: pvEquity,
    shares,
    convertShares: NOTES.filter((note) => converted.has(note.id)).reduce((sum, note) => sum + note.shares, 0),
    equityRaiseShares: (issued * 1e6) / assumptions.issuePrice,
    perShareRaw,
    perShare: floorShare(perShareRaw),
    fundingGap: issued * 1e6,
    stakes: STAKES * 1e6,
  };
  const y2027 = years.find((row) => row.year === 2027);
  return {
    name,
    assumptions,
    years,
    terminalMethod: terminalValueM > 0 ? "gordon" : "none",
    terminalFcff: fcff1 * 1e6,
    terminalValue: terminalValueM * 1e6,
    pvTerminal,
    enterpriseValue: pvTerminal,
    tvShareOfEv: pvEquity > 0 ? pvTerminal / pvEquity : null,
    ebitda2027: y2027?.ebitda ?? 0,
    netDebt2027: (() => {
      const row = years.find((item) => item.year === 2027);
      return row ? row.debt - row.cash : 0;
    })(),
    paybackMonths: hardwarePaybackMonths(ALL_IN_PER_MW, Q3_ACV_FLOOR, assumptions.margin),
    hardwarePaybackMonths: hardwarePaybackMonths(serverPerMw, assumptions.rateNew, assumptions.margin),
    floorBinds: perShareRaw < 0,
    convertedNoteIds: [...converted],
    equityIssued: issued * 1e6,
    interestTotal: interestTotal * 1e6,
    deferredDrawn: deferredDrawn * 1e6,
    engineRevenue2028,
    bridge,
  };
}

export function runCase(name: CaseName, overrides: Partial<ModelAssumptions> = {}): ModelResult {
  const assumptions: ModelAssumptions = {
    ...CASES[name],
    ...overrides,
    issuePrice: overrides.issuePrice ?? MARKET_PRICE,
  };
  if (!(assumptions.discount > assumptions.terminalGrowth)) {
    throw new Error("Discount rate has to be above terminal growth.");
  }
  let converted = new Set<string>();
  let last = project(name, assumptions, converted);
  for (let pass = 0; pass < 8; pass += 1) {
    const next = new Set(
      NOTES.filter((note) => last.bridge.perShareRaw > note.conversionPrice).map((note) => note.id),
    );
    const same = next.size === converted.size && [...next].every((id) => converted.has(id));
    converted = next;
    last = project(name, assumptions, converted);
    if (same) break;
  }
  const bridge = last.bridge;
  return {
    ok: true,
    version: MODEL_VERSION,
    headline: "settled",
    bridges: { none: bridge, all: bridge },
    ...last,
  };
}

export function headlineValue(result: ModelResult): number {
  return result.bridges.none.perShare;
}

export function rawHeadline(result: ModelResult): number {
  return result.bridges.none.perShareRaw;
}

export function allCases(): ModelResult[] {
  return (["bear", "base", "bull"] as const).map((caseName) => runCase(caseName));
}

export function weightedValue(results: ModelResult[] = allCases()): number {
  return results.reduce((sum, result) => sum + result.assumptions.weight * headlineValue(result), 0);
}

export function weightedRaw(results: ModelResult[] = allCases()): number {
  return results.reduce((sum, result) => sum + result.assumptions.weight * rawHeadline(result), 0);
}

export function declineSensitivity(name: CaseName = "base"): { decline: number; perShareRaw: number; perShare: number; tvShare: number | null }[] {
  return [0, 0.1, 0.2, 0.25].map((decline) => {
    const result = runCase(name, { costDecline: decline });
    return {
      decline,
      perShareRaw: result.bridges.none.perShareRaw,
      perShare: result.bridges.none.perShare,
      tvShare: result.tvShareOfEv,
    };
  });
}

export function waccGrowthGrid(): { wacc: number; growth: number; perShare: number | null; perShareRaw: number | null }[][] {
  const rates = [0.09, 0.11, 0.12, 0.14];
  const growths = [0, 0.02, 0.03];
  return rates.map((discount) =>
    growths.map((terminalGrowth) => {
      if (discount <= terminalGrowth) return { wacc: discount, growth: terminalGrowth, perShare: null, perShareRaw: null };
      const result = runCase("base", { discount, terminalGrowth });
      return {
        wacc: discount,
        growth: terminalGrowth,
        perShare: result.bridges.none.perShare,
        perShareRaw: result.bridges.none.perShareRaw,
      };
    }),
  );
}

export function marginMaintenanceGrid(): { margin: number; maintenanceToRevenue: number; perShare: number }[][] {
  return [];
}

export type PeerImplied = {
  id: string;
  name: string;
  ticker: string;
  asOf: string;
  source: string;
  definition: string;
  evToEbitda: number | null;
  evToRevenue: number | null;
  perShareOnEbitda: number | null;
  perShareOnRevenue: number | null;
  divergesFromDcf: boolean;
  applied: boolean;
};

export function peerCrossCheck(result: ModelResult): PeerImplied[] {
  const ebitda = result.ebitda2027 / 1e6;
  const revenue = (result.years.find((row) => row.year === 2027)?.revenue ?? 0) / 1e6;
  const netDebt = result.netDebt2027 / 1e6;
  const shares = result.years.find((row) => row.year === 2027)?.shares ?? result.bridges.none.shares;
  const discountYears = yearsOut(2027);
  return peersFile.peers.map((peer) => {
    const adjusted = peer.id !== "crwv-gaap";
    const equity = (multiple: number | null, flow: number) => {
      if (multiple == null || !adjusted) return null;
      const future = multiple * flow - netDebt;
      return future / (1 + result.assumptions.discount) ** discountYears / (shares / 1e6);
    };
    return {
      id: peer.id,
      name: peer.name,
      ticker: peer.ticker,
      asOf: peer.asOf,
      source: peer.source,
      definition: peer.definition,
      evToEbitda: peer.evToEbitda,
      evToRevenue: peer.evToRevenue,
      perShareOnEbitda: equity(peer.evToEbitda, ebitda),
      perShareOnRevenue: equity(peer.evToRevenue, revenue),
      divergesFromDcf: false,
      applied: adjusted,
    };
  });
}

export function marketMultiple(result: ModelResult): { equity: number; ev: number; evToEbitda: number | null } {
  const equity = (MARKET_PRICE * BASIC_ECONOMIC_SHARES) / 1e6;
  const netDebt = (capital.debtCarryingTotal.value - capital.cash.unrestricted.value);
  const ev = equity + netDebt;
  const ebitda = result.ebitda2027 / 1e6;
  return { equity, ev, evToEbitda: ebitda > 0 ? ev / ebitda : null };
}
