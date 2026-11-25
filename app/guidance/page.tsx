import { GuidanceChart } from "@/components/result-charts";
import { Badge } from "@/components/ui/badge";
import { SourceA } from "@/components/metric-value";
import { guidance } from "@/lib/load";
import { scoreGuidance, STATUS_TONE, groupGuidance, guidanceStatusLabel } from "@/lib/guidance";

export const metadata = { title: "Guidance — Nebius model" };

export default function GuidancePage() {
  const groups = groupGuidance(guidance.items, guidance.asOf);
  return (
    <div className="space-y-8">
      <header>
        <div className="eyebrow">/ 02 / Company commitments</div>
        <h1 className="text-3xl font-semibold text-accent">Guidance tracker</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Each item is the company&apos;s own wording, dated, and linked. Status is computed
          from the latest revision and the stored actual. Beat means a finished result above
          the top of a range or more than 2% above a point target. Met means inside the range,
          or at or above a minimum. Missed means below the floor after the period ended.
          Behind means the company moved the date later. Open means the period is not over.
          Undisclosed means the period ended and no comparable actual was found. Superseded
          means the company replaced the target.
        </p>
      </header>
      {groups.map((group) => (
        <section key={group.year ?? "ongoing"} className="min-w-0 space-y-4">
          <h2 className="border-b border-line pb-2 text-xl font-medium">{group.title}</h2>
          <ul className="space-y-4">
        {group.items.map((item) => {
          const score = scoreGuidance(item, guidance.asOf);
          return (
            <li key={item.id} className="rounded-xl border border-line bg-panel p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-medium">{item.title}</h3>
                <Badge tone={STATUS_TONE[score.status]}>{guidanceStatusLabel(score.status)}</Badge>
                <span className="text-xs text-muted">{item.unit}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{score.basis}</p>
              <GuidanceChart item={item} />
              {item.actual ? (
                <p className="mt-2 text-sm">
                  Latest actual:{" "}
                  {item.actual.value == null ? (
                    <span className="text-amber">not a number</span>
                  ) : (
                    <SourceA source={item.actual.source} sources={guidance.sources}>
                      {item.actual.value.toLocaleString("en-US")}
                      {item.actual.approximate ? " (approximate)" : ""}
                    </SourceA>
                  )}
                  <span className="text-muted"> as of {item.actual.asOf}. {item.actual.note}</span>
                </p>
              ) : (
                <p className="mt-2 text-sm text-amber">No actual stored.</p>
              )}
              <ol className="mt-3 space-y-2 border-l border-line pl-3">
                {item.revisions.map((revision, index) => (
                  <li key={`${revision.date}-${index}`} className="text-sm">
                    <span className="font-mono text-xs text-muted">{revision.date}</span>{" "}
                    <Badge tone="neutral">{revision.change}</Badge>{" "}
                    <SourceA source={revision.source} sources={guidance.sources}>
                      {revision.label}
                    </SourceA>
                    {revision.note ? <span className="text-muted"> — {revision.note}</span> : null}
                  </li>
                ))}
              </ol>
            </li>
          );
        })}
          </ul>
        </section>
      ))}
      <section>
        <h2 className="text-lg font-medium">Left out on purpose</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted">
          {(guidance as { omitted?: string[] }).omitted?.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
