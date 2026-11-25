import capital from "@/data/capital-structure.json";
import peersFile from "@/data/peers.json";

/**
 * Model 3.1.0. Educational arithmetic, not a price target.
 * The headline is unlevered free cash flow on today's shares.
 * Share issuance is a side panel and does not enter that value.
 */
export const MODEL_VERSION = "3.1.0";
export const VALUATION_DATE = "2026-11-24";
export const MARKET_PRICE = 87.31;
export const MARKET_PRICE_SOURCE =
  "Yahoo Finance, StockAnalysis (S&P Global Market Intelligence), and FinancialContent, NBIS close on November 24, 2026.";

export const TAX_RATE = 0.258;
export const SBC_RATE = 0.02;
export const SECURED_COUPON = 0.039 + 0.025;
/** Servers and network as a share of all-in build cost. Samaritan's GB200 stack is about 69% IT. Scotiabank's published split is about 64%. */
export const IT_SHARE = 0.69;
export const SERVER_LIFE = 5;
export const SHELL_LIFE = 15;
export const DISCLOSED_ACTIVE_MW = 170;
export const RECURRING_RUN_RATE = 648.7 * 4;
export const RATE_ON_DISCLOSED_ACTIVE = RECURRING_RUN_RATE / DISCLOSED_ACTIVE_MW;
export const DISCLOSED_PAYBACK_MONTHS = 19;
/** Share of growth capex treated as a customer prepayment. The 75–85% coverage mix of prepayments and debt is not split in the filings. */
export const PREPAY_SHARE = 0.5;
const OPENING_DA = 354.7 * 4;
const SPENT = { revenue: 1962.1, ebitda: 831.5, capex: 15430.7 };
const CAPEX_2026 = 27000;
const DEFERRED_CURRENT = capital.deferredRevenue.current.value;
const DEFERRED_LONG = capital.deferredRevenue.nonCurrent.value;
export const DEFERRED_REVENUE = DEFERRED_CURRENT + DEFERRED_LONG;
export const STAKES = 737.1 + 780.6 + 97.0 + 4.7;
export const AWARD_SHARES = 9_736_161;
/** Fleet realization of the contract rate. The same curve in every case. It is what makes 2026 and 2027 land on the guides. */
export const FLEET_UTIL: Record<number, number> = {
  2026: 0.25,
  2027: 0.38,
  2028: 0.5,
  2029: 0.62,
  2030: 0.75,
  2031: 0.88,
  2032: 1,
};

export const BENCHMARKS = [
  { name: "Bernstein, about November 2025", allIn: 35, note: "About $35 million per MW, as cited in secondary write-ups of Bernstein's AI-infrastructure work." },
  { name: "Samaritan Research, GB200 NVL72", allIn: 37.9, note: "About $37.9 million per MW, with servers and network near 69% of the stack." },
  { name: "Scotiabank, via secondary reports", allIn: 40.3, note: "About $40.3 million per MW, with facilities near 36% (IT share about 64%)." },
  { name: "2027 company midpoint", allIn: 42.5, note: "$42.5 billion of 2027 capex divided by the more-than-1 GW that budget is sized for. Includes land, shells, and power for later years." },
];

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
}));

export function floorShare(value: number): number {
  return Math.max(0, value);
}

export type ModelAssumptions = {
  weight: number;
  revenueGuide2026: number;
  revenueGuide2027: number;
  marginNear: number;
  marginSteady: number;
  capex2027: number;
  allIn: number;
  coverage: number;
  discount: number;
  terminalGrowth: number;
  spread: number;
  costDecline: number;
  rate: number;
  mwCap: number;
  ends: Record<number, number>;
  /** Bear: the largest disclosed customer, 33% of third-quarter revenue, is idle in 2028 and then re-let at 75% of the case rate. */
  topCustomerStress: boolean;
  summary: string;
};

const baseEnds: Record<number, number> = { 2026: 800, 2027: 1800, 2028: 2600, 2029: 3400, 2030: 4200, 2031: 5000, 2032: 5000 };
const bearEnds: Record<number, number> = { 2026: 750, 2027: 1700, 2028: 2100, 2029: 2500, 2030: 2800, 2031: 3000, 2032: 3000 };
const bullEnds: Record<number, number> = { 2026: 1000, 2027: 2100, 2028: 3000, 2029: 4000, 2030: 5000, 2031: 5000, 2032: 5000 };

export const CASES: Record<CaseName, ModelAssumptions> = {
  bear: {
    weight: 0.3,
    revenueGuide2026: 3000,
    revenueGuide2027: 12000,
    marginNear: 0.4,
    marginSteady: 0.4,
    capex2027: 45000,
    allIn: 42.5,
    coverage: 0.75,
    discount: 0.12,
    terminalGrowth: 0.02,
    spread: 0,
    costDecline: 0,
    rate: 20,
    mwCap: 3000,
    ends: bearEnds,
    topCustomerStress: true,
    summary:
      "The near-term revenue path still has to sit near the low end of the guides. The contract rate is the second-quarter floor, $20 million, not the third-quarter floor. The margin stays at the 40% group guide. New megawatts after 2027 are charged at the $42.5 million program figure. In 2028 the largest customer, 33% of third-quarter revenue, is idle, and after that the same share is re-let at three quarters of the case rate. The fleet stops at 3 GW. The discount rate is 12%, and terminal growth earns no spread.",
  },
  base: {
    weight: 0.5,
    revenueGuide2026: 3000,
    revenueGuide2027: 12500,
    marginNear: 0.4,
    marginSteady: 0.5,
    capex2027: 42500,
    allIn: 37.9,
    coverage: 0.8,
    discount: 0.11,
    terminalGrowth: 0.02,
    spread: 0.03,
    costDecline: 0,
    rate: 25,
    mwCap: 5000,
    ends: baseEnds,
    topCustomerStress: false,
    summary:
      "2026 and 2027 stay inside a quarter of the guides: the low end of 2026 and the midpoint of the $12–13 billion outlook. The margin is 40% through 2027, then 50%, the second-quarter 2026 AI-cloud margin. New megawatts after 2027 cost $37.9 million, the Samaritan GB200 benchmark, with 69% of that in servers and network. The contract rate is the third-quarter floor, $25 million. The fleet stops at 5 GW. The discount rate is 11%, and new capital earns 3 points more than that.",
  },
  bull: {
    weight: 0.2,
    revenueGuide2026: 3200,
    revenueGuide2027: 13000,
    marginNear: 0.4,
    marginSteady: 0.532,
    capex2027: 40000,
    allIn: 35,
    coverage: 0.85,
    discount: 0.11,
    terminalGrowth: 0.02,
    spread: 0.03,
    costDecline: 0,
    rate: 25,
    mwCap: 5000,
    ends: bullEnds,
    topCustomerStress: false,
    summary:
      "2026 uses the call's high end, $3.2 billion. The furnished letter still describes the low end of a $3.0–3.4 billion range and does not itself print $3.2 billion. 2027 is the top of the $12–13 billion outlook. The margin is 40% through 2027, then 53.2%, the third-quarter AI-cloud print, which includes about $325 million of non-recurring revenue. New megawatts after 2027 cost $35 million, the low end of the published benchmark range. The discount rate is 11%, the same as the base.",
  },
};

function priceFactor(year: number, decline: number): number {
  return (1 - decline) ** Math.max(0, year - 2027);
}

function concentration(name: CaseName, year: number, on: boolean): number {
  if (!on || year < 2028) return 1;
  if (year === 2028) return 1 - 0.33;
  return 1 - 0.33 * 0.25;
}

export function engineRevenue(name: CaseName, year: number, assumptions: ModelAssumptions): { revenue: number; mw: number; averageMw: number } {
  const end = Math.min(assumptions.ends[year], assumptions.mwCap);
  const start = year === 2026 ? DISCLOSED_ACTIVE_MW : Math.min(assumptions.ends[year - 1], assumptions.mwCap);
  const averageMw = (start + end) / 2;
  const revenue =
    averageMw *
    assumptions.rate *
    FLEET_UTIL[year] *
    priceFactor(year, assumptions.costDecline) *
    concentration(name, year, assumptions.topCustomerStress);
  return { revenue, mw: end, averageMw };
}

function deferredDraw(year: number): number {
  if (year === 2026) return DEFERRED_CURRENT / 4;
  if (year === 2027) return (DEFERRED_CURRENT * 3) / 4;
  if (year >= 2028 && year <= 2031) return DEFERRED_LONG / 4;
  return 0;
}

export function paybackMonths(capexPerMw: number, rate: number, margin: number): number {
  const ebitda = rate * margin - rate * SBC_RATE;
  if (ebitda <= 0) return Number.POSITIVE_INFINITY;
  return (12 * capexPerMw) / ebitda;
}

function yearsOut(year: number): number {
  return year - 2026 + 37 / 365;
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
  mode: "today";
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

export type DilutionPanel = {
  equityCheck: number;
  sharesIfIssued: number;
  perShareIfDiluted: number;
  debtDraws: number;
  prepayments: number;
  interestMemo: number;
  endDebtMemo: number;
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
  headline: "today";
  ebitda2027: number;
  netDebt2027: number;
  paybackMonths: number;
  disclosedPaybackMonths: number;
  hardwarePaybackMonths: number;
  floorBinds: boolean;
  convertedNoteIds: string[];
  equityIssued: number;
  interestTotal: number;
  deferredDrawn: number;
  engineRevenue2026: number;
  engineRevenue2027: number;
  engineRevenue2028: number;
  dilution: DilutionPanel;
  marginalNpv: number;
};

function project(name: CaseName, assumptions: ModelAssumptions, converted: Set<string>): Omit<ModelResult, "ok" | "version" | "headline" | "bridges"> & { bridge: Bridge } {
  const it = IT_SHARE;
  const decline = assumptions.costDecline;
  let nol = 0;
  let deferredDrawn = 0;
  let prepayBalance = 0;
  let debtMemo = 0;
  let interestMemo = 0;
  let equityCheck = 0;
  let prepayTotal = 0;
  const taxLots: { annual: number; left: number }[] = [{ annual: OPENING_DA, left: SERVER_LIFE }];
  const years: ModelYear[] = [];
  const adds: { year: number; mw: number }[] = [];
  let prior = DISCLOSED_ACTIVE_MW;

  const addLot = (amount: number, life: number) => {
    if (amount > 0) taxLots.push({ annual: amount / life, left: life });
  };

  for (let year = 2026; year <= 2032; year += 1) {
    const engine = engineRevenue(name, year, assumptions);
    const fullRevenue = engine.revenue;
    const margin = year <= 2027 ? assumptions.marginNear : assumptions.marginSteady;
    const revenue = year === 2026 ? fullRevenue - SPENT.revenue : fullRevenue;
    const ebitda = revenue * margin - revenue * SBC_RATE;
    const draw = deferredDraw(year);
    deferredDrawn += draw;

    const endMw = engine.mw;
    const added = Math.max(0, endMw - prior);
    if (added > 0) adds.push({ year, mw: added });
    const serverNow = assumptions.allIn * it * priceFactor(year, decline);
    const shell = assumptions.allIn * (1 - it);
    let growth = 0;
    let maintenance = 0;
    if (year === 2026) growth = CAPEX_2026 - SPENT.capex;
    else if (year === 2027) growth = assumptions.capex2027;
    else {
      growth = added * (serverNow + shell);
      maintenance += (DISCLOSED_ACTIVE_MW / SERVER_LIFE) * serverNow;
      for (const cohort of adds) {
        if (year === cohort.year + SERVER_LIFE) maintenance += cohort.mw * serverNow;
      }
      maintenance += (prior * shell) / SHELL_LIFE;
    }
    prior = endMw;

    addLot((growth + maintenance) * it, SERVER_LIFE);
    addLot((growth + maintenance) * (1 - it), SHELL_LIFE);
    const depreciation = taxLots.reduce((sum, lot) => sum + (lot.left > 0 ? lot.annual : 0), 0);
    for (const lot of taxLots) if (lot.left > 0) lot.left -= 1;

    const prepayIn = PREPAY_SHARE * growth;
    prepayTotal += prepayIn;
    prepayBalance += prepayIn;
    const recognition = Math.min(prepayBalance, prepayBalance / 4);
    prepayBalance -= recognition;

    const debtDraw = Math.max(0, assumptions.coverage - PREPAY_SHARE) * growth;
    debtMemo += debtDraw;
    const interest = debtMemo * SECURED_COUPON * (year === 2026 ? 37 / 365 : 1);
    interestMemo += interest;
    equityCheck += (1 - assumptions.coverage) * growth;

    const taxable = ebitda - depreciation;
    let tax = 0;
    if (taxable < 0) nol += -taxable;
    else {
      const used = Math.min(nol, taxable);
      nol -= used;
      tax = TAX_RATE * (taxable - used);
    }
    const fcff = ebitda - draw - recognition + prepayIn - tax - growth - maintenance;
    const t = yearsOut(year);
    years.push({
      year,
      label: String(year),
      mw: endMw,
      revenue: (year === 2026 ? fullRevenue : revenue) * 1e6,
      ebitda: (year === 2026 ? fullRevenue * margin - fullRevenue * SBC_RATE : ebitda) * 1e6,
      depreciation: depreciation * 1e6,
      growthCapex: growth * 1e6,
      maintenanceCapex: maintenance * 1e6,
      interest: interest * 1e6,
      fcff: fcff * 1e6,
      pv: (fcff * 1e6) / (1 + assumptions.discount) ** t,
      debt: 0,
      cash: 0,
      shares: 0,
    });
  }

  const last = engineRevenue(name, 2032, assumptions);
  const terminalRate = assumptions.rate * priceFactor(2032, decline) * concentration(name, 2032, assumptions.topCustomerStress);
  const terminalRevenue = last.mw * FLEET_UTIL[2032] * terminalRate;
  const terminalEbitda = terminalRevenue * assumptions.marginSteady - terminalRevenue * SBC_RATE;
  const serverTerminal = assumptions.allIn * it * priceFactor(2032, decline);
  const shell = assumptions.allIn * (1 - it);
  const terminalMaint = (last.mw * serverTerminal) / SERVER_LIFE + (last.mw * shell) / SHELL_LIFE;
  const nopat = (terminalEbitda - terminalMaint) * (1 - TAX_RATE);
  const r = assumptions.discount;
  const g = assumptions.terminalGrowth;
  const roic = r + assumptions.spread;
  const reinvest = roic > 0 ? g / roic : 1;
  const fcff1 = nopat > 0 ? nopat * (1 + g) * (1 - reinvest) : 0;
  const terminalValueM = fcff1 > 0 && r > g ? fcff1 / (r - g) : 0;
  const explicit = years.reduce((sum, row) => sum + row.pv, 0);
  const pvTerminal = (terminalValueM * 1e6) / (1 + r) ** yearsOut(2032);
  const enterprise = explicit + pvTerminal;

  const debt =
    (termLoan!.principalOutstanding! +
      NOTES.filter((note) => !converted.has(note.id)).reduce((sum, note) => sum + note.principal, 0)) *
    1e6;
  const cash = capital.cash.unrestricted.value * 1e6;
  const stakes = STAKES * 1e6;
  const shares =
    BASIC_ECONOMIC_SHARES +
    AWARD_SHARES +
    NOTES.filter((note) => converted.has(note.id)).reduce((sum, note) => sum + note.shares, 0);
  const equity = enterprise - debt + cash + stakes;
  const perShareRaw = equity / shares;
  const bridge: Bridge = {
    mode: "today",
    enterpriseValue: enterprise,
    debt,
    cash,
    netDebt: debt - cash,
    equityFirm: equity,
    shares,
    convertShares: NOTES.filter((note) => converted.has(note.id)).reduce((sum, note) => sum + note.shares, 0),
    equityRaiseShares: 0,
    perShareRaw,
    perShare: floorShare(perShareRaw),
    fundingGap: equityCheck * 1e6,
    stakes,
  };
  const issuedShares = (equityCheck * 1e6) / MARKET_PRICE;
  return {
    name,
    assumptions,
    years,
    terminalMethod: terminalValueM > 0 ? "gordon" : "none",
    terminalFcff: fcff1 * 1e6,
    terminalValue: terminalValueM * 1e6,
    pvTerminal,
    enterpriseValue: enterprise,
    tvShareOfEv: enterprise > 0 ? pvTerminal / enterprise : null,
    ebitda2027: years.find((row) => row.year === 2027)?.ebitda ?? 0,
    netDebt2027: bridge.netDebt,
    paybackMonths: paybackMonths(assumptions.allIn, assumptions.rate, assumptions.marginSteady),
    disclosedPaybackMonths: DISCLOSED_PAYBACK_MONTHS,
    hardwarePaybackMonths: paybackMonths(assumptions.allIn * IT_SHARE, assumptions.rate, assumptions.marginSteady),
    floorBinds: perShareRaw < 0,
    convertedNoteIds: [...converted],
    equityIssued: 0,
    interestTotal: interestMemo * 1e6,
    deferredDrawn: deferredDrawn * 1e6,
    engineRevenue2026: engineRevenue(name, 2026, assumptions).revenue,
    engineRevenue2027: engineRevenue(name, 2027, assumptions).revenue,
    engineRevenue2028: engineRevenue(name, 2028, assumptions).revenue,
    dilution: {
      equityCheck: equityCheck * 1e6,
      sharesIfIssued: issuedShares,
      perShareIfDiluted: equity / (shares + issuedShares),
      debtDraws: (debtMemo) * 1e6,
      prepayments: prepayTotal * 1e6,
      interestMemo: interestMemo * 1e6,
      endDebtMemo: debtMemo * 1e6,
    },
    marginalNpv: marginalNpv(assumptions),
    bridge,
  };
}

function marginalNpv(assumptions: ModelAssumptions): number {
  const server = assumptions.allIn * IT_SHARE;
  const shell = assumptions.allIn * (1 - IT_SHARE);
  const maint = server / SERVER_LIFE + shell / SHELL_LIFE;
  const ebitda = assumptions.rate * assumptions.marginSteady - assumptions.rate * SBC_RATE;
  const taxable = ebitda - maint;
  const tax = taxable > 0 ? TAX_RATE * taxable : 0;
  const fcff = ebitda - tax - maint;
  const roic = assumptions.discount + assumptions.spread;
  const g = assumptions.terminalGrowth;
  const grown = fcff > 0 ? fcff * (1 + g) * (1 - g / roic) : 0;
  const tv = grown > 0 ? grown / (assumptions.discount - g) : 0;
  return tv - assumptions.allIn;
}

export function runCase(name: CaseName, overrides: Partial<ModelAssumptions> = {}): ModelResult {
  const assumptions: ModelAssumptions = { ...CASES[name], ...overrides, ends: overrides.ends ?? CASES[name].ends };
  if (!(assumptions.discount > assumptions.terminalGrowth)) throw new Error("Discount rate has to be above terminal growth.");
  let converted = new Set<string>();
  let last = project(name, assumptions, converted);
  for (let pass = 0; pass < 8; pass += 1) {
    const next = new Set(NOTES.filter((note) => last.bridge.perShareRaw > note.conversionPrice).map((note) => note.id));
    const same = next.size === converted.size && [...next].every((id) => converted.has(id));
    converted = next;
    last = project(name, assumptions, converted);
    if (same) break;
  }
  return {
    ok: true,
    version: MODEL_VERSION,
    headline: "today",
    bridges: { none: last.bridge, all: last.bridge },
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
  return [0, 0.1, 0.2, 0.25].map((costDecline) => {
    const result = runCase(name, { costDecline });
    return {
      decline: costDecline,
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
      return { wacc: discount, growth: terminalGrowth, perShare: result.bridges.none.perShare, perShareRaw: result.bridges.none.perShareRaw };
    }),
  );
}

export function marginCapexGrid(): { margin: number; capex: number; perShareRaw: number }[][] {
  const margins = [0.4, 0.5, 0.532];
  const capexes = [35, 37.9, 40.3, 42.5, 50];
  return margins.map((marginSteady) =>
    capexes.map((allIn) => ({
      margin: marginSteady,
      capex: allIn,
      perShareRaw: runCase("base", { marginSteady, allIn }).bridges.none.perShareRaw,
    })),
  );
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
  const netDebt = (capital.debtCarryingTotal.value - capital.cash.unrestricted.value);
  const shares = result.bridges.none.shares;
  const discountYears = yearsOut(2027);
  return peersFile.peers.map((peer) => {
    const equity = (multiple: number | null, flow: number) => {
      if (multiple == null) return null;
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
      applied: true,
    };
  });
}

export function marketMultiple(result: ModelResult): { equity: number; ev: number; evToEbitda: number | null } {
  const equity = (MARKET_PRICE * BASIC_ECONOMIC_SHARES) / 1e6;
  const netDebt = capital.debtCarryingTotal.value - capital.cash.unrestricted.value;
  const ev = equity + netDebt;
  const ebitda = result.ebitda2027 / 1e6;
  return { equity, ev, evToEbitda: ebitda > 0 ? ev / ebitda : null };
}
