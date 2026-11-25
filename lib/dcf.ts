import capital from "@/data/capital-structure.json";

/** Model 4.0.0. Educational valuation arithmetic. Not a price target, forecast, rating, or recommendation. */
export const MODEL_VERSION = "4.0.0";
export const VALUATION_DATE = "2026-11-24";
/** Hand-entered close. Used only in the dilution panel, grids, and the bridge tie-out. Not in the headline path. */
export const REFERENCE_CLOSE = { value: 87.31, asOf: "2026-11-24", label: "Closing price entered manually as of 2026-11-24; not live; may be out of date." };

const TAX = 0.258;
const CAPINT_STRIP = 0.0125;
const SFC_RATE = 0.05;
const COMPUTE_SHARE = 0.7;
const COMPUTE_LIFE = 5;
const FAC_LIFE = 15;
const ENERGIZED_YE25 = 170;
const OTHER_SEG_REV_Q = 10;
const NINE_M = { revenue: 1962.1, ebitda: 831.5, capex: 15430.7 };
const CAPEX_FY25 = 4066;
const CAPEX_FY26 = 27000;
const OPENING_DR = 9409.2;
const DR_CURRENT = 1445.5;
/** Opening non-current deferred revenue releases over four years, Q4 2027 through Q3 2031, in every case. */
const OPENING_NC_YEARS = 4;
const OPENING_NOL = 1236;
const OPENING_TAX_BASE = CAPEX_FY25 + NINE_M.capex;
const NL_OFFSET_FIXED = 1;
const CASH = 7425.6;
const TERM_LOAN = 733.1;
const TERM_LOAN_PRINCIPAL = 751.8;
const OTHER_DEBT = 28;
const NCI = 1;
const S_BASIC = 313_968_341;
const RSU = 5_493_478;
const OPT_N = 6_735_333;
const OPT_K = 90.18;
const MIN_CASH = 2000;
const LEV_CAP = 3.5;
const PAYBACK_DISCLOSED = 19;
const YEARS = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];
const HIST_E: Record<number, number> = { 0: 315, 1: 460, 2: 605 };
const HIST_LAG = 2;
const FORCED = new Set(["jun-2029", "jun-2031"]);

export type CaseName = "bear" | "base" | "bull";

type Note = {
  id: string;
  carrying: number;
  shares: number;
  principal: number;
  maturity: string;
  coupon: number;
};

export function conversionShares(note: { originalOutstanding: number; conversionRatePerThousand: number }): number {
  return Math.round(note.originalOutstanding * 1000 * note.conversionRatePerThousand);
}

const NOTES: Note[] = capital.notes.map((note) => ({
  id: note.id,
  carrying: note.carrying,
    shares: conversionShares(note),
  principal: note.maturityPrincipal,
  maturity: note.maturity,
  coupon: note.originalOutstanding * note.coupon,
}));

type Conc = {
  nj_mw: number;
  nj_year: number;
  nj_idle_q: number;
  top_loss_year: number;
  top_share: number;
  idle_years: number;
  relet: number;
  decremental: number;
} | null;

type CaseInput = {
  weight: number;
  mw_ye: number[];
  lag_q: number;
  util: number;
  legacy_rate: number;
  acv: number;
  vintage_step: number;
  price_decline: number;
  cost_decline: number;
  margin: { q4_2026: number; 2027: number; ss: number };
  allin: number;
  capex2027: number;
  cm_deal: number;
  prepay_q4_2026: number;
  prepay_2027: number;
  prepay_share: number;
  dr_years: number;
  sfc_rate: number;
  abf_share: number;
  kd: number;
  wacc: number;
  g: number;
  spread: number;
  us_share: { 2026: number; 2027: number; later: number };
  bonus: number;
  conc: Conc;
  capint_strip?: number;
  open_nc_years?: number;
};

const bearConc: Conc = {
  nj_mw: 100,
  nj_year: 2028,
  nj_idle_q: 2,
  top_loss_year: 2029,
  top_share: 0.15,
  idle_years: 1,
  relet: 0.8,
  decremental: 0.8,
};

export const CASES: Record<CaseName, CaseInput> = {
  bear: {
    weight: 0.35,
    mw_ye: [650, 1450, 1600, 1750, 1800, 1800, 1800, 1800, 1800, 1800],
    lag_q: 2,
    util: 0.85,
    legacy_rate: 12,
    acv: 20,
    vintage_step: 0.3,
    price_decline: 0.06,
    cost_decline: 0.02,
    margin: { q4_2026: 0.291, 2027: 0.364, ss: 0.4 },
    allin: 40,
    capex2027: 45000,
    cm_deal: 0.5,
    prepay_q4_2026: 2500,
    prepay_2027: 12000,
    prepay_share: 0.15,
    dr_years: 5,
    sfc_rate: SFC_RATE,
    abf_share: 0.3,
    kd: 0.0925,
    wacc: 0.125,
    g: 0.02,
    spread: 0,
    us_share: { 2026: 0.49, 2027: 0.49, later: 0.49 },
    bonus: 0,
    conc: bearConc,
  },
  base: {
    weight: 0.45,
    mw_ye: [750, 1800, 2900, 3900, 4700, 5200, 5500, 5500, 5500, 5500],
    lag_q: 2,
    util: 0.92,
    legacy_rate: 12,
    acv: 25,
    vintage_step: 0.2,
    price_decline: 0.03,
    cost_decline: 0.03,
    margin: { q4_2026: 0.353, 2027: 0.454, ss: 0.5 },
    allin: 35,
    capex2027: 42500,
    cm_deal: 0.58,
    prepay_q4_2026: 3000,
    prepay_2027: 18500,
    prepay_share: 0.35,
    dr_years: 4,
    sfc_rate: SFC_RATE,
    abf_share: 0.4,
    kd: 0.07,
    wacc: 0.11,
    g: 0.025,
    spread: 0.02,
    us_share: { 2026: 0.65, 2027: 0.75, later: 0.75 },
    bonus: 0.5,
    conc: null,
  },
  bull: {
    weight: 0.2,
    mw_ye: [850, 1900, 3100, 4300, 5500, 5500, 5500, 5500, 5500, 5500],
    lag_q: 2,
    util: 0.92,
    legacy_rate: 12,
    acv: 27.5,
    vintage_step: 0.1,
    price_decline: 0.02,
    cost_decline: 0.04,
    margin: { q4_2026: 0.4, 2027: 0.504, ss: 0.55 },
    allin: 31.5,
    capex2027: 40000,
    cm_deal: 0.65,
    prepay_q4_2026: 3500,
    prepay_2027: 20000,
    prepay_share: 0.45,
    dr_years: 3,
    sfc_rate: SFC_RATE,
    abf_share: 0.4,
    kd: 0.064,
    wacc: 0.105,
    g: 0.03,
    spread: 0.03,
    us_share: { 2026: 0.7, 2027: 0.8, later: 0.8 },
    bonus: 1,
    conc: null,
  },
};

const SBC: Record<CaseName, { 2026: number; 2027: number; 2028: number; ss: number }> = {
  bear: { 2026: 0.07, 2027: 0.06, 2028: 0.05, ss: 0.045 },
  base: { 2026: 0.06, 2027: 0.04, 2028: 0.035, ss: 0.03 },
  bull: { 2026: 0.05, 2027: 0.03, 2028: 0.025, ss: 0.02 },
};

function daysBetween(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  const [Y, M, D] = VALUATION_DATE.split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(Y, M - 1, D)) / 86400000);
}

function discT(year: number): number {
  if (year === 2026) return daysBetween("2026-11-15") / 365;
  return daysBetween(`${year}-07-02`) / 365;
}

function qyear(q: number): number {
  return 2026 + Math.floor(q / 4);
}

function sbcRate(name: CaseName, year: number): number {
  const path = SBC[name];
  if (year === 2026) return path[2026];
  if (year === 2027) return path[2027];
  if (year === 2028) return path[2028];
  return path.ss;
}

function marginRate(c: CaseInput, year: number): number {
  if (year === 2026) return c.margin.q4_2026;
  if (year === 2027) return c.margin[2027];
  if (year === 2028) return 0.5 * (c.margin[2027] + c.margin.ss);
  return c.margin.ss;
}

export type YearRow = {
  year: number;
  revenue: number;
  ebitda: number;
  sbc: number;
  sfc: number;
  cashTax: number;
  capexNet: number;
  dDr: number;
  fcff: number;
  pv: number;
  t: number;
  prepay: number;
  release: number;
  drEnd: number;
  mw: number;
};

export type Bridge = {
  perShareRaw: number;
  perShare: number;
  equity: number;
  claims: number;
  shares: number;
  converted: string[];
  options: number;
  equityValue: number;
};

export type ModelResult = {
  name: CaseName;
  weight: number;
  rows: YearRow[];
  fy2026: number;
  fy2027: number;
  fy2028: number;
  q3Engine: number;
  ev: number;
  pvExplicit: number;
  pvTerminal: number;
  tv: number;
  nopatT: number;
  ronic: number;
  bridge: Bridge;
  clampedRaw: number;
  payback: { deal: number; fleetCompute: number; fleetAllIn: number; npv: number };
  wacc: number;
  revByStart: Record<number, number>;
  itByStart: Record<number, number>;
  maintT: number;
  itCapex: number;
  facCapex: number;
  inputs: CaseInput;
};

type Cohort = { s: number; mw: number; rate: number; lag: number; legacy: boolean; refresh: number };

function perShare(eqPre: number, sharesFixed: number): { v: number; opt: number } {
  let v = (eqPre / sharesFixed) * 1e6;
  for (let i = 0; i < 100; i += 1) {
    const opt = v > 0 ? OPT_N * Math.max(0, 1 - OPT_K / v) : 0;
    const next = (eqPre / (sharesFixed + opt)) * 1e6;
    if (Math.abs(next - v) < 1e-9) {
      v = next;
      break;
    }
    v = next;
  }
  const opt = v > 0 ? OPT_N * Math.max(0, 1 - OPT_K / v) : 0;
  return { v, opt };
}

export function bridge(ev: number, stakes: number, extraCash = 0, extraDebt = 0): Bridge {
  const order = NOTES.filter((note) => !FORCED.has(note.id)).sort((a, b) => a.carrying / a.shares - b.carrying / b.shares);
  const fixed: Bridge[] = [];
  for (let k = 0; k <= order.length; k += 1) {
    const conv = new Set<string>([...FORCED, ...order.slice(0, k).map((note) => note.id)]);
    const debt = NOTES.filter((note) => !conv.has(note.id)).reduce((sum, note) => sum + note.carrying, 0) + TERM_LOAN + OTHER_DEBT + NCI + extraDebt;
    const sh = S_BASIC + RSU + NOTES.filter((note) => conv.has(note.id)).reduce((sum, note) => sum + note.shares, 0);
    const eq = ev + CASH + extraCash + stakes - debt;
    const { v, opt } = perShare(eq, sh);
    const ok = order.every((note) => (v * note.shares) / 1e6 > note.carrying === conv.has(note.id));
    if (ok) {
      fixed.push({
        perShareRaw: v,
        perShare: Math.max(0, v),
        equity: eq,
        claims: debt,
        shares: sh + opt,
        converted: [...conv].sort(),
        options: opt,
        equityValue: (v * (sh + opt)) / 1e6,
      });
    }
  }
  if (!fixed.length) throw new Error("no consistent conversion fixed point");
  return fixed.reduce((best, item) => (item.perShareRaw < best.perShareRaw ? item : best));
}

export function runCase(name: CaseName, overrides: Partial<CaseInput> & { margin_ss?: number; computeShare?: number } = {}): ModelResult {
  const base = CASES[name];
  const c: CaseInput = {
    ...base,
    ...overrides,
    margin: overrides.margin_ss != null ? { ...base.margin, ss: overrides.margin_ss } : overrides.margin ?? base.margin,
    mw_ye: overrides.mw_ye ?? base.mw_ye,
    us_share: overrides.us_share ?? base.us_share,
    conc: overrides.conc === undefined ? base.conc : overrides.conc,
  };
  const cs = overrides.computeShare ?? COMPUTE_SHARE;
  const strip = c.capint_strip ?? CAPINT_STRIP;
  const it0 = c.allin * cs;
  const fac = c.allin * (1 - cs);
  const P = (y: number) => (1 - c.price_decline) ** Math.max(0, y - 2027);
  const Cix = (y: number) => (1 - c.cost_decline) ** Math.max(0, y - 2027);
  const NQ = 40;
  const E: Record<number, number> = { [-1]: ENERGIZED_YE25 };
  for (let i = 0; i < YEARS.length; i += 1) {
    const prev = i === 0 ? ENERGIZED_YE25 : c.mw_ye[i - 1];
    for (let k = 0; k < 4; k += 1) E[4 * i + k] = prev + (c.mw_ye[i] - prev) * ((k + 1) / 4);
  }
  for (const [q, v] of Object.entries(HIST_E)) E[Number(q)] = v;
  const cohorts: Cohort[] = [{ s: -1, mw: ENERGIZED_YE25, rate: c.legacy_rate, lag: 0, legacy: true, refresh: 16 }];
  for (let q = 0; q < NQ; q += 1) {
    const d = E[q] - E[q - 1];
    if (d <= 0) continue;
    const legacy = q <= 1;
    const rate = legacy ? c.legacy_rate : c.acv * P(qyear(q));
    const lag = q <= 2 ? HIST_LAG : c.lag_q;
    cohorts.push({ s: q, mw: d, rate, lag, legacy, refresh: q + 4 * COMPUTE_LIFE });
  }
  const revQ: Record<number, number> = {};
  for (let q = 0; q < NQ; q += 1) revQ[q] = 0;
  const refreshMw: Record<number, number> = {};
  for (const y of YEARS) refreshMw[y] = 0;
  const revByStart: Record<number, number> = {};
  const cohortRev = (co: Cohort, q: number) => {
    if (q < co.s) return 0;
    const startBill = co.s + co.lag;
    if (q < startBill) return 0;
    const frac = (q === startBill && co.lag > 0) || (q === co.s && co.s >= 0 && co.lag === 0) ? 0.5 : 1;
    const f = co.legacy ? 1 : (1 - c.vintage_step) ** Math.floor((q - startBill) / 4 / 2);
    return (co.mw * c.util * co.rate * f * frac) / 4;
  };
  const queue = [...cohorts];
  while (queue.length) {
    const co = queue.shift()!;
    const sy = co.s >= 0 ? qyear(co.s) : 2025;
    for (let q = Math.max(0, co.s); q < Math.min(NQ, co.refresh); q += 1) {
      const x = cohortRev(co, q);
      revQ[q] += x;
      if (!co.legacy) revByStart[sy] = (revByStart[sy] ?? 0) + x;
    }
    if (co.refresh < NQ) {
      refreshMw[qyear(co.refresh)] += co.mw;
      queue.push({ s: co.refresh, mw: co.mw, rate: c.acv * P(qyear(co.refresh)), lag: 0, legacy: false, refresh: co.refresh + 4 * COMPUTE_LIFE });
    }
  }
  const rev: Record<number, number> = {};
  const full: Record<number, number> = {};
  YEARS.forEach((y, i) => {
    let sum = 0;
    for (let k = 0; k < 4; k += 1) sum += revQ[4 * i + k];
    full[y] = sum + 4 * OTHER_SEG_REV_Q;
    rev[y] = y === 2026 ? revQ[4 * i + 3] + OTHER_SEG_REV_Q : full[y];
  });
  const fy2026 = NINE_M.revenue + rev[2026];
  const concLoss: Record<number, number> = {};
  for (const y of YEARS) concLoss[y] = 0;
  const k = c.conc;
  if (k) {
    for (const y of YEARS) {
      if (y === k.nj_year) {
        const rateY = c.acv * P(y) * c.util;
        concLoss[y] += k.nj_mw * rateY * (k.nj_idle_q / 4 + (1 - k.nj_idle_q / 4) * (1 - k.relet));
      } else if (y > k.nj_year) concLoss[y] += k.nj_mw * c.acv * P(y) * c.util * (1 - k.relet);
      if (y >= k.top_loss_year) {
        const share = y < k.top_loss_year + k.idle_years ? k.top_share : k.top_share * (1 - k.relet);
        concLoss[y] += (rev[y] - concLoss[y]) * share;
      }
    }
    for (const y of YEARS) rev[y] -= concLoss[y];
  }
  const N = c.dr_years;
  const relOpen: Record<number, number> = {};
  const inflow: Record<number, number> = {};
  const relNew: Record<number, number> = {};
  for (const y of YEARS) {
    relOpen[y] = 0;
    inflow[y] = 0;
    relNew[y] = 0;
  }
  relOpen[2026] += DR_CURRENT / 4;
  relOpen[2027] += (DR_CURRENT * 3) / 4;
  const nOpen = c.open_nc_years ?? OPENING_NC_YEARS;
  const nc = OPENING_DR - DR_CURRENT;
  const perQ = nc / (4 * nOpen);
  for (let qq = 0; qq < 4 * nOpen; qq += 1) {
    const yq = 2027 + Math.floor((qq + 3) / 4);
    if (relOpen[yq] != null) relOpen[yq] += perQ;
  }
  let dr = OPENING_DR;
  const cumPre = (CAPEX_FY25 + CAPEX_FY26 + c.capex2027) * (1 - strip);
  let prebuild = Math.max(0, cumPre - c.mw_ye[1] * c.allin);
  const taxAssets: { y: number; a: number; L: number }[] = [];
  const remCompute = OPENING_TAX_BASE * cs;
  const remFac = OPENING_TAX_BASE * (1 - cs);
  let nol = OPENING_NOL;
  const itByStart: Record<number, number> = {};
  const rows: YearRow[] = [];
  YEARS.forEach((y, i) => {
    const mwPrev = i === 0 ? ENERGIZED_YE25 : c.mw_ye[i - 1];
    const add = c.mw_ye[i] - mwPrev;
    let capexC = 0;
    let comp = 0;
    let facx = 0;
    let growth = 0;
    let refresh = 0;
    if (y === 2026 || y === 2027) {
      capexC = (y === 2026 ? CAPEX_FY26 - NINE_M.capex : c.capex2027) * (1 - strip);
      comp = capexC * cs;
      facx = capexC - comp;
      growth = capexC;
    } else {
      const gIt = Math.max(0, add) * it0 * Cix(y);
      const gFac = Math.max(0, add) * fac;
      const gross = gIt + gFac;
      const credit = Math.min(prebuild, gross);
      prebuild -= credit;
      const scale = gross > 0 ? (gross - credit) / gross : 0;
      refresh = refreshMw[y] * it0 * Cix(y);
      itByStart[y] = gIt + refresh;
      growth = gross - credit;
      comp = gIt * scale + refresh;
      facx = gFac * scale;
      capexC = growth + refresh;
    }
    const m = marginRate(c, y);
    let ebitda = rev[y] * m;
    if (k && concLoss[y] > 0) ebitda = (rev[y] + concLoss[y]) * m - concLoss[y] * k.decremental;
    const sbc = rev[y] * sbcRate(name, y);
    inflow[y] = y === 2026 ? c.prepay_q4_2026 : y === 2027 ? c.prepay_2027 : c.prepay_share * capexC;
    for (const yy of YEARS) if (yy > y && yy <= y + N) relNew[yy] += inflow[y] / N;
    const release = relOpen[y] + relNew[y];
    const dDr = inflow[y] - release;
    const drStart = dr;
    dr += dDr;
    const frac = y === 2026 ? 0.25 : 1;
    const sfc = c.sfc_rate * 0.5 * (drStart + dr) * frac;
    const us = y === 2026 ? c.us_share[2026] : y === 2027 ? c.us_share[2027] : c.us_share.later;
    const bonusAmt = comp * us * c.bonus;
    taxAssets.push({ y, a: comp - bonusAmt, L: COMPUTE_LIFE });
    taxAssets.push({ y, a: facx, L: FAC_LIFE });
    let taxdep = bonusAmt;
    for (const asset of taxAssets) if (asset.y <= y && y < asset.y + asset.L) taxdep += (asset.a / asset.L) * frac;
    taxdep += (y < 2031 ? remCompute / 4.5 : 0) * frac + (remFac / 15) * frac;
    const taxable = ebitda - sfc - sbc - taxdep;
    let cashTax = 0;
    if (taxable > 0) {
      const use = Math.min(nol, NL_OFFSET_FIXED + 0.5 * Math.max(0, taxable - NL_OFFSET_FIXED));
      nol -= use;
      cashTax = TAX * (taxable - use);
    } else nol += -taxable;
    const fcff = ebitda - sfc - sbc - cashTax - capexC + dDr;
    const t = discT(y);
    rows.push({
      year: y,
      revenue: rev[y],
      ebitda,
      sbc,
      sfc,
      cashTax,
      capexNet: capexC,
      dDr,
      fcff,
      pv: fcff / (1 + c.wacc) ** t,
      t,
      prepay: inflow[y],
      release,
      drEnd: dr,
      mw: c.mw_ye[i],
    });
  });
  const pvExplicit = rows.reduce((sum, row) => sum + row.pv, 0);
  const last = rows[rows.length - 1];
  const fleet = c.mw_ye[c.mw_ye.length - 1];
  const maintT = fleet * ((it0 * Cix(2036)) / COMPUTE_LIFE + fac / FAC_LIFE);
  const nopatT = (last.revenue * (c.margin.ss - SBC[name].ss) - maintT - c.sfc_rate * last.drEnd) * (1 - TAX) * (1 + c.g);
  const ronic = c.wacc + c.spread;
  const tvOps = (nopatT * (1 - c.g / ronic)) / (c.wacc - c.g);
  const tvDr = (c.g * last.drEnd) / (c.wacc - c.g);
  const tv = tvOps + tvDr;
  const tT = daysBetween("2035-12-31") / 365;
  const pvTerminal = tv / (1 + c.wacc) ** tT;
  const ev = pvExplicit + pvTerminal;
  const stakes = name === "bear" ? 1064.9 : 1603.9;
  const br = bridge(ev, stakes);
  const clamped = bridge(pvExplicit + Math.max(0, tv) / (1 + c.wacc) ** tT, stakes);
  const fleetEbitda = c.acv * c.util * (c.margin.ss - SBC[name].ss);
  const r = c.wacc;
  const npv =
    (fleetEbitda * (1 - TAX) + TAX * (it0 / COMPUTE_LIFE + fac / FAC_LIFE)) / r -
    c.allin -
    it0 / ((1 + r) ** COMPUTE_LIFE - 1) -
    fac / ((1 + r) ** FAC_LIFE - 1);
  return {
    name,
    weight: c.weight,
    rows,
    fy2026,
    fy2027: rows[1].revenue,
    fy2028: rows[2].revenue,
    q3Engine: revQ[2] + OTHER_SEG_REV_Q,
    ev,
    pvExplicit,
    pvTerminal,
    tv,
    nopatT,
    ronic,
    bridge: br,
    clampedRaw: clamped.perShareRaw,
    payback: {
      deal: (12 * it0) / (c.acv * c.cm_deal),
      fleetCompute: (12 * it0) / fleetEbitda,
      fleetAllIn: (12 * c.allin) / fleetEbitda,
      npv,
    },
    wacc: c.wacc,
    revByStart,
    itByStart,
    maintT,
    itCapex: it0,
    facCapex: fac,
    inputs: c,
  };
}

export function allCases(): ModelResult[] {
  return (["bear", "base", "bull"] as const).map((name) => runCase(name));
}

export function floorShare(value: number): number {
  return Math.max(0, value);
}

export function headlineValue(result: ModelResult): number {
  return result.bridge.perShare;
}

export function rawHeadline(result: ModelResult): number {
  return result.bridge.perShareRaw;
}

export function weightedValue(results = allCases()): number {
  return results.reduce((sum, result) => sum + result.weight * result.bridge.perShare, 0);
}

export function weightedRaw(results = allCases()): number {
  return results.reduce((sum, result) => sum + result.weight * result.bridge.perShareRaw, 0);
}

export function sideRuns() {
  const base = CASES.base.mw_ye;
  const scaled = [base[0], Math.round(base[0] + 0.62 * (base[1] - base[0])), ...base.slice(2).map((v) => Math.round(0.62 * v))];
  const guide = runCase("base", { mw_ye: scaled });
  const lag = runCase("base", { lag_q: 3 });
  const sfc0 = runCase("base", { sfc_rate: 0 });
  const sfc7 = runCase("base", { sfc_rate: 0.07 });
  return {
    guide: { fy27: guide.fy2027, fy28: guide.fy2028, ev: guide.ev, raw: guide.bridge.perShareRaw, shown: guide.bridge.perShare, mw: scaled },
    lag: { fy27: lag.fy2027, fy28: lag.fy2028, ev: lag.ev, raw: lag.bridge.perShareRaw, shown: lag.bridge.perShare },
    sfc0: sfc0.bridge.perShareRaw,
    sfc7: sfc7.bridge.perShareRaw,
  };
}

export function marginCapexGrid(): { margin: number; capex: number; raw: number }[][] {
  const margins = [0.4, 0.45, 0.5, 0.55, 0.6];
  const capexes = [25, 30, 35, 40, 45];
  return margins.map((margin_ss) => capexes.map((allin) => ({ margin: margin_ss, capex: allin, raw: runCase("base", { margin_ss, allin }).bridge.perShareRaw })));
}

export function waccGrowthGrid(): { wacc: number; growth: number; raw: number | null }[][] {
  const waccs = [0.095, 0.1, 0.11, 0.12, 0.125];
  const gs = [0.015, 0.02, 0.025, 0.03, 0.035];
  return waccs.map((wacc) => gs.map((g) => ({ wacc, growth: g, raw: wacc > g ? runCase("base", { wacc, g }).bridge.perShareRaw : null })));
}

export function priceCostGrid(): { price: number; cost: number; raw: number }[][] {
  const ds = [0, 0.03, 0.06, 0.09];
  return ds.map((price_decline) => ds.map((cost_decline) => ({ price: price_decline, cost: cost_decline, raw: runCase("base", { price_decline, cost_decline }).bridge.perShareRaw })));
}

export function financingPanel(result: ModelResult) {
  const c = result.inputs;
  const conv = new Set(result.bridge.converted);
  let notes = NOTES.filter((note) => !conv.has(note.id)).map((note) => ({ ...note }));
  let tl = TERM_LOAN_PRINCIPAL;
  const abf: { y: number; a: number }[] = [];
  let corp = 0;
  let cash = CASH;
  let equity = 0;
  let interest = 0;
  let refinanced = 0;
  let corpTotal = 0;
  for (const row of result.rows) {
    const frac = row.year === 2026 ? 0.25 : 1;
    const coupon = notes.reduce((sum, note) => sum + note.coupon, 0) * frac;
    const tlInt = tl * 0.064 * frac;
    const abfBal = abf.reduce((sum, tranche) => sum + tranche.a, 0);
    const intNew = (abfBal + corp) * c.kd * frac;
    const yearInterest = coupon + tlInt + intNew;
    interest += yearInterest;
    const mat = notes.filter((note) => Number(note.maturity.slice(0, 4)) === row.year);
    const refi = mat.reduce((sum, note) => sum + note.principal, 0);
    refinanced += refi;
    notes = notes.filter((note) => !mat.includes(note));
    const tlPay = row.year >= 2027 ? Math.min(tl, (TERM_LOAN_PRINCIPAL / 4) * frac) : 0;
    tl -= tlPay;
    let abfAmort = 0;
    const next: { y: number; a: number }[] = [];
    for (const tranche of abf) {
      const pay = row.year > tranche.y ? Math.min((tranche.a / 5) * frac, tranche.a) : 0;
      abfAmort += pay;
      next.push({ y: tranche.y, a: tranche.a - pay });
    }
    const abfDraw = row.year >= 2027 ? c.abf_share * row.capexNet : 0;
    next.push({ y: row.year, a: abfDraw });
    abf.length = 0;
    abf.push(...next);
    cash += row.fcff - yearInterest - refi - tlPay - abfAmort + abfDraw;
    if (cash < MIN_CASH) {
      let need = MIN_CASH - cash;
      const cap = Math.max(0, LEV_CAP * Math.max(row.ebitda, 0) * (1 / frac) - (abf.reduce((sum, tranche) => sum + tranche.a, 0) + corp + tl + notes.reduce((sum, note) => sum + note.principal, 0)));
      const draw = Math.min(need, cap);
      corp += draw;
      corpTotal += draw;
      need -= draw;
      equity += need;
      cash = MIN_CASH;
    }
  }
  const price = REFERENCE_CLOSE.value;
  const newShares = price > 0 ? (equity / price) * 1e6 : Infinity;
  const vPost = (result.bridge.equityValue + equity) / (result.bridge.shares + newShares) * 1e6;
  return { equity, interest, refinanced, corpTotal, newShares, vPost, price };
}

export const BASIC_ECONOMIC_SHARES = S_BASIC;
export const DISCLOSED_PAYBACK_MONTHS = PAYBACK_DISCLOSED;
export const COMPUTE_SHARE_OF_CAPEX = COMPUTE_SHARE;
