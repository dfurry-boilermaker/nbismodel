export type SourceRef = {
  id: string;
  url: string;
  title: string;
  date: string;
};

export type Metric = {
  value: number | null;
  source: string;
  basis?: string;
  note?: string;
  firstReported?: {
    value: number;
    source: string;
    note?: string;
  };
};

export type Quarter = {
  id: string;
  label: string;
  periodEnd: string;
  reportedAt: string;
  scopeNote?: string;
  revenue: Metric;
  adjustedEbitda: Metric;
  netIncome: Metric;
  capex: Metric;
  cash: Metric;
  debtCurrent: Metric | null;
  debtNonCurrent: Metric | null;
  arr: Metric | null;
  segmentRevenue: { name: string; metric: Metric }[];
  other: { label: string; metric: Metric }[];
};

export type FinancialsFile = {
  schemaVersion: 1;
  unit: string;
  retrievedAt: string;
  cik: string;
  forms: string;
  sources: Record<string, SourceRef>;
  quarters: Quarter[];
  annual: {
    id: string;
    label: string;
    source: string;
    rows: { line: string; y2023: number | null; y2024: number | null; y2025: number | null; note?: string }[];
  };
};

export type GuidanceRevision = {
  date: string;
  label: string;
  low: number | null;
  high: number | null;
  periodEnd: string | null;
  source: string;
  change: "initial" | "raised" | "cut" | "reaffirmed" | "timing" | "replaced";
  note: string;
};

export type GuidanceActual = {
  value: number | null;
  asOf: string;
  source: string;
  approximate?: boolean;
  note: string;
};

export type GuidanceItem = {
  id: string;
  title: string;
  unit: string;
  kind: "range" | "minimum" | "point";
  revisions: GuidanceRevision[];
  actual: GuidanceActual | null;
};

export type GuidanceFile = {
  schemaVersion: 1;
  retrievedAt: string;
  asOf: string;
  sources: Record<string, SourceRef>;
  items: GuidanceItem[];
};

export type Scene = {
  file: string;
  acquiredAt: string;
  cloudCoverPct: number | null;
  itemId: string;
  platform: string | null;
};

export type MwSlot = {
  value: number | null;
  label: string;
  source: string;
  note: string;
};

export type DataCenter = {
  id: string;
  name: string;
  place: string;
  relationship: string;
  status: string;
  cloudRegions: string[];
  capacity: string;
  /** Megawatts split by the company's own categories. Null means not disclosed. */
  mw: {
    contractedOrPlanned: MwSlot;
    operational: MwSlot;
    energized: MwSlot;
  };
  dates: string;
  pin: { lat: number; lon: number; precision: string } | null;
  scenes: Scene[];
  sources: string[];
  notes: string;
};

export type DataCentersFile = {
  schemaVersion: 1;
  retrievedAt: string;
  imageryNote: string;
  sources: Record<string, SourceRef>;
  sites: DataCenter[];
};

export type Holding = {
  id: string;
  name: string;
  relationship: string;
  metrics: { label: string; value: string; source: string; note?: string }[];
  unavailable: string[];
};

export type HoldingsFile = {
  schemaVersion: 1;
  retrievedAt: string;
  sources: Record<string, SourceRef>;
  holdings: Holding[];
};

export type QuoteFile = {
  schemaVersion: 1;
  symbol: string;
  retrievedAt: string | null;
  sourceUrl: string | null;
  sourceTitle: string | null;
  currency: "USD";
  points: { date: string; close: number }[];
  note: string;
};

export type Feed = {
  id: string;
  label: string;
  updatedAt: string | null;
  sourceUrl: string;
  cadence: string;
  state: "snapshot" | "empty" | "live-capable";
  note: string;
};

export type FeedsFile = {
  schemaVersion: 1;
  asOf: string;
  feeds: Feed[];
};
