import type { ReactNode } from "react";
import type { Metric, SourceRef } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export function SourceA({
  source,
  sources,
  children,
}: {
  source: string;
  sources: Record<string, SourceRef>;
  children: ReactNode;
}) {
  const ref = sources[source];
  if (!ref) return <span>{children}</span>;
  return (
    <a
      href={ref.url}
      title={`${ref.title} (${ref.date})`}
      target="_blank"
      rel="noreferrer"
      className="underline decoration-white/20 hover:decoration-accent"
    >
      {children}
    </a>
  );
}

export function MetricValue({
  metric,
  sources,
  digits = 1,
}: {
  metric: Metric | null;
  sources: Record<string, SourceRef>;
  digits?: number;
}) {
  if (!metric || metric.value == null) {
    return <span className="text-amber">Not disclosed</span>;
  }
  const negative = metric.value < 0;
  return (
    <span className={negative ? "text-bad" : "text-foreground"}>
      <SourceA source={metric.source} sources={sources}>
        {formatNumber(metric.value, digits)}
      </SourceA>
      {metric.firstReported && metric.firstReported.value !== metric.value ? (
        <span className="mt-0.5 block text-[11px] text-muted">
          First reported{" "}
          <SourceA source={metric.firstReported.source} sources={sources}>
            {formatNumber(metric.firstReported.value, digits)}
          </SourceA>
        </span>
      ) : null}
    </span>
  );
}
