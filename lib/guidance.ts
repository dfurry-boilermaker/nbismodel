import type { GuidanceItem, GuidanceRevision } from "@/lib/types";

export type GuidanceStatus =
  | "ahead"
  | "behind"
  | "met"
  | "missed"
  | "open"
  | "undisclosed"
  | "superseded";

export function latestRevision(item: GuidanceItem): GuidanceRevision {
  const last = item.revisions.at(-1);
  if (!last) throw new Error(`Guidance item ${item.id} has no revisions`);
  return last;
}

function compare(
  value: number,
  low: number | null,
  high: number | null,
  kind: GuidanceItem["kind"],
): GuidanceStatus {
  if (kind === "minimum") {
    if (low == null) return "open";
    return value + 1e-9 >= low ? "met" : "missed";
  }
  const floor = low ?? high;
  const cap = high ?? low;
  if (floor == null || cap == null) return "open";
  if (value > (floor === cap ? cap + Math.abs(cap) * 0.02 : cap)) return "ahead";
  if (value + 1e-9 >= floor) return "met";
  return "missed";
}

export function scoreGuidance(item: GuidanceItem, asOf: string): {
  status: GuidanceStatus;
  basis: string;
} {
  const rev = latestRevision(item);
  if (rev.change === "replaced") {
    return {
      status: "superseded",
      basis: rev.note || "The company replaced this target. See the newer item.",
    };
  }
  if (rev.change === "timing" && (rev.periodEnd == null || rev.periodEnd > asOf)) {
    return {
      status: "behind",
      basis: rev.note || "The company moved the schedule later.",
    };
  }
  const actual = item.actual;
  const periodOver = rev.periodEnd != null && rev.periodEnd <= asOf;
  const interim =
    actual?.value != null && rev.periodEnd != null && actual.asOf < rev.periodEnd;
  if (interim) {
    return {
      status: periodOver ? "undisclosed" : "open",
      basis: periodOver ? "Only an interim figure is available for the completed period." : `Latest reported figure is ${actual?.note ?? "an interim actual"} It is not scored against a period that has not ended.`,
    };
  }
  if (actual == null || actual.value == null) {
    if (periodOver) {
      return {
        status: "undisclosed",
        basis: actual?.note || "The period has ended and no comparable actual was found in the sources reviewed.",
      };
    }
    return {
      status: "open",
      basis: "The period has not ended, and there is no actual to score yet.",
    };
  }
  if (!periodOver && rev.periodEnd) {
    return {
      status: "open",
      basis: "An actual is stored, and the target date is still ahead.",
    };
  }
  const status = compare(actual.value, rev.low, rev.high, item.kind);
  const approx = actual.approximate ? " The actual is approximate, as the company stated it." : "";
  return {
    status,
    basis: `Compared ${actual.value} with the latest numeric target (${rev.label}).${approx}`,
  };
}

export const STATUS_TONE: Record<GuidanceStatus, "good" | "bad" | "amber" | "open" | "neutral"> = {
  ahead: "good",
  met: "good",
  behind: "bad",
  missed: "bad",
  open: "open",
  undisclosed: "amber",
  superseded: "neutral",
};

/** Display wording is independent of the existing scoring and regression tests. */
export function guidanceStatusLabel(status: GuidanceStatus): string {
  return status === "ahead" ? "beat" : status;
}

/** Current-year targets first, then upcoming years, then historical years newest first. */
export function groupGuidance(items: GuidanceItem[], asOf: string): { year: number | null; title: string; items: GuidanceItem[] }[] {
  const currentYear = Number(asOf.slice(0, 4));
  const byYear = new Map<number | null, GuidanceItem[]>();
  for (const item of items) {
    const end = latestRevision(item).periodEnd;
    const year = end ? Number(end.slice(0, 4)) : null;
    byYear.set(year, [...(byYear.get(year) ?? []), item]);
  }
  const years = [...byYear.keys()].filter((year): year is number => year !== null);
  const order = [
    ...(byYear.has(currentYear) ? [currentYear] : []),
    ...years.filter(year => year > currentYear).sort((a, b) => a - b),
    ...(byYear.has(null) ? [null] : []),
    ...years.filter(year => year < currentYear).sort((a, b) => b - a),
  ];
  return order.map(year => ({
    year,
    title: year === null ? "Ongoing guidance" : year > currentYear ? `${year} outlook` : `${year} guidance`,
    items: byYear.get(year) ?? [],
  }));
}
