export type DcfInput = {
  asOf: string;
  shares: number;
  cashMillions: number;
  debtMillions: number;
  revenue2026: number;
  revenue2027: number;
  margin2026: number;
  margin2027: number;
  marginLater: number;
  capex2026: number;
  capex2027: number;
  capexPercentAfter: number;
  growthAfter: number;
  wacc: number;
  terminalGrowth: number;
  taxRate: number;
};

export type DcfYear = {
  year: number;
  revenue: number;
  ebitda: number;
  tax: number;
  capex: number;
  fcff: number;
  yearsOut: number;
  pv: number;
};

export type DcfResult =
  | { ok: false; reason: string }
  | {
      ok: true;
      years: DcfYear[];
      terminalFcff: number;
      terminalValue: number;
      pvTerminal: number;
      enterpriseValue: number;
      netDebt: number;
      equityValue: number;
      perShare: number;
    };

function daysBetween(start: string, end: string): number {
  const a = Date.parse(`${start}T00:00:00Z`);
  const b = Date.parse(`${end}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** Explicit five-year FCFF. Dollars, not millions. Tax applies to positive EBITDA because depreciation is not forecast. */
export function runDcf(input: DcfInput): DcfResult {
  if (input.wacc <= input.terminalGrowth) {
    return { ok: false, reason: "WACC has to be above the terminal growth rate, or the terminal value is undefined." };
  }
  if (input.shares <= 0) return { ok: false, reason: "Share count has to be positive." };
  const revenues = [
    input.revenue2026,
    input.revenue2027,
    input.revenue2027 * (1 + input.growthAfter),
    input.revenue2027 * (1 + input.growthAfter) ** 2,
    input.revenue2027 * (1 + input.growthAfter) ** 3,
  ];
  const margins = [
    input.margin2026,
    input.margin2027,
    input.marginLater,
    input.marginLater,
    input.marginLater,
  ];
  const years: DcfYear[] = revenues.map((revenueM, index) => {
    const year = 2026 + index;
    const revenue = revenueM * 1e6;
    const ebitda = revenue * margins[index];
    const tax = Math.max(ebitda, 0) * input.taxRate;
    const capex =
      index === 0
        ? input.capex2026 * 1e6
        : index === 1
          ? input.capex2027 * 1e6
          : revenue * input.capexPercentAfter;
    const fcff = ebitda - tax - capex;
    const yearsOut = daysBetween(input.asOf, `${year}-12-31`) / 365;
    const pv = fcff / (1 + input.wacc) ** yearsOut;
    return { year, revenue, ebitda, tax, capex, fcff, yearsOut, pv };
  });
  const last = years[years.length - 1];
  const nextRevenue = last.revenue * (1 + input.terminalGrowth);
  const nextEbitda = nextRevenue * input.marginLater;
  const nextTax = Math.max(nextEbitda, 0) * input.taxRate;
  const nextCapex = nextRevenue * input.capexPercentAfter;
  const terminalFcff = nextEbitda - nextTax - nextCapex;
  const terminalValue = terminalFcff / (input.wacc - input.terminalGrowth);
  const pvTerminal = terminalValue / (1 + input.wacc) ** last.yearsOut;
  const enterpriseValue = years.reduce((sum, row) => sum + row.pv, 0) + pvTerminal;
  const netDebt = (input.debtMillions - input.cashMillions) * 1e6;
  const equityValue = enterpriseValue - netDebt;
  return {
    ok: true,
    years,
    terminalFcff,
    terminalValue,
    pvTerminal,
    enterpriseValue,
    netDebt,
    equityValue,
    perShare: equityValue / input.shares,
  };
}

export const COMPANY_CASE: DcfInput = {
  asOf: "2026-11-23",
  shares: 292_902_405,
  cashMillions: 7425.6,
  debtMillions: 187.5 + 14003.3,
  revenue2026: 3000,
  revenue2027: 12500,
  margin2026: 0.4,
  margin2027: 0.4,
  marginLater: 0.4,
  capex2026: 27000,
  capex2027: 42500,
  capexPercentAfter: 0.35,
  growthAfter: 0.2,
  wacc: 0.1,
  terminalGrowth: 0.03,
  taxRate: 0,
};

export function preset(name: "company" | "bear" | "bull"): DcfInput {
  if (name === "company") return { ...COMPANY_CASE };
  if (name === "bear") {
    return {
      ...COMPANY_CASE,
      revenue2026: 3000,
      revenue2027: 12000,
      margin2027: 0.25,
      marginLater: 0.25,
      capex2027: 45000,
      capexPercentAfter: 0.5,
      growthAfter: 0.1,
      wacc: 0.12,
      terminalGrowth: 0.02,
    };
  }
  return {
    ...COMPANY_CASE,
    revenue2026: 3400,
    revenue2027: 13000,
    capex2027: 40000,
    capexPercentAfter: 0.25,
    growthAfter: 0.3,
    wacc: 0.08,
    terminalGrowth: 0.03,
  };
}
