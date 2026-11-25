import type { ReactNode } from "react";
import capital from "@/data/capital-structure.json";
import { conversionShares } from "@/lib/dcf";
import { SourceA } from "@/components/metric-value";
import { formatNumber } from "@/lib/utils";

export function CapitalStructure() {
  const sources = capital.sources;
  const convertShares = capital.notes.reduce((sum, note) => sum + conversionShares(note), 0);
  const basic = capital.shares.outstanding.value + capital.shares.prefundedWarrants.shares;
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-medium">Capital structure at September 30, 2026</h2>
      <p className="text-sm text-muted">
        Principal for the convertible notes is the original principal still outstanding. The
        filing&apos;s principal column is the accreted amount due at maturity. Conversion rates
        apply to original principal. Settlement can be cash, shares, or a mix, at the company&apos;s
        election. If every remaining note were share-settled at the initial rate, that would be{" "}
        {convertShares.toLocaleString("en-US")} Class A shares. Basic shares in the model are the{" "}
        {capital.shares.outstanding.value.toLocaleString("en-US")} outstanding plus{" "}
        {capital.shares.prefundedWarrants.shares.toLocaleString("en-US")} NVIDIA pre-funded warrants,
        {" "}{basic.toLocaleString("en-US")} in total.
      </p>
      <div className="hidden overflow-x-auto rounded-xl border border-line lg:block">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase tracking-wide text-muted">
            <tr>
              {["Instrument", "Original left", "Coupon", "Conversion", "Maturity principal", "Carrying", "Fair value"].map((heading) => (
                <th key={heading} className="px-3 py-2 font-medium">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {capital.notes.map((note) => (
              <tr key={note.id} className="border-t border-line align-top">
                <td className="px-3 py-2">
                  <SourceA source={note.source} sources={sources}>{note.name}</SourceA>
                  <span className="mt-1 block text-xs text-muted">{note.note}</span>
                </td>
                <td className="px-3 py-2 font-mono">{formatNumber(note.originalOutstanding, 1)}</td>
                <td className="px-3 py-2 font-mono">{(note.coupon * 100).toFixed(2)}%</td>
                <td className="px-3 py-2 font-mono">
                  <SourceA source={note.rateSource} sources={sources}>
                    {note.conversionRatePerThousand} / $1,000
                  </SourceA>
                  <span className="mt-1 block text-xs text-muted">${note.conversionPrice.toFixed(2)}</span>
                </td>
                <td className="px-3 py-2 font-mono">{formatNumber(note.maturityPrincipal, 1)}</td>
                <td className="px-3 py-2 font-mono">{formatNumber(note.carrying, 1)}</td>
                <td className="px-3 py-2 font-mono">{formatNumber(note.fairValue, 1)}</td>
              </tr>
            ))}
            {capital.facilities.map((facility) => (
              <tr key={facility.id} className="border-t border-line align-top">
                <td className="px-3 py-2">
                  <SourceA source={facility.source} sources={sources}>{facility.name}</SourceA>
                  <span className="mt-1 block text-xs text-muted">{facility.note}</span>
                </td>
                <td className="px-3 py-2 font-mono">{facility.principalOutstanding == null ? "—" : formatNumber(facility.principalOutstanding, 1)}</td>
                <td className="px-3 py-2 font-mono">{facility.margin == null ? "See note" : `SOFR+${(facility.margin * 100).toFixed(2)}%`}</td>
                <td className="px-3 py-2 text-muted">Not convertible</td>
                <td className="px-3 py-2 font-mono">{facility.commitment ? formatNumber(facility.commitment, 1) : "—"}</td>
                <td className="px-3 py-2 font-mono">{facility.carrying == null ? "Not on the Sept 30 sheet" : formatNumber(facility.carrying, 1)}</td>
                <td className="px-3 py-2 text-muted">{facility.drawn == null && facility.commitment ? "Drawn amount not disclosed" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 lg:hidden">
        {capital.notes.map((note) => (
          <article key={note.id} className="min-w-0 border border-line bg-panel p-3">
            <h3 className="text-sm font-medium"><SourceA source={note.source} sources={sources}>{note.name}</SourceA></h3>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-4">
              <CapitalField label="Original principal left">{formatNumber(note.originalOutstanding, 1)}</CapitalField>
              <CapitalField label="Coupon">{(note.coupon * 100).toFixed(2)}%</CapitalField>
              <CapitalField label="Conversion rate"><SourceA source={note.rateSource} sources={sources}>{note.conversionRatePerThousand} / $1,000</SourceA></CapitalField>
              <CapitalField label="Conversion price">${note.conversionPrice.toFixed(2)}</CapitalField>
              <CapitalField label="Maturity principal">{formatNumber(note.maturityPrincipal, 1)}</CapitalField>
              <CapitalField label="Carrying value">{formatNumber(note.carrying, 1)}</CapitalField>
              <CapitalField label="Fair value">{formatNumber(note.fairValue, 1)}</CapitalField>
            </dl>
            {note.note ? <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-muted">{note.note}</p> : null}
          </article>
        ))}
        {capital.facilities.map((facility) => (
          <article key={facility.id} className="min-w-0 border border-line bg-panel p-3">
            <h3 className="text-sm font-medium"><SourceA source={facility.source} sources={sources}>{facility.name}</SourceA></h3>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-4">
              <CapitalField label="Principal outstanding">{facility.principalOutstanding == null ? "—" : formatNumber(facility.principalOutstanding, 1)}</CapitalField>
              <CapitalField label="Rate">{facility.margin == null ? "See note" : `SOFR+${(facility.margin * 100).toFixed(2)}%`}</CapitalField>
              <CapitalField label="Commitment">{facility.commitment ? formatNumber(facility.commitment, 1) : "—"}</CapitalField>
              <CapitalField label="Carrying value">{facility.carrying == null ? "Not on the Sept 30 sheet" : formatNumber(facility.carrying, 1)}</CapitalField>
              <CapitalField label="Conversion">Not convertible</CapitalField>
              <CapitalField label="Draw status">{facility.drawn == null && facility.commitment ? "Drawn amount not disclosed" : "—"}</CapitalField>
            </dl>
            {facility.note ? <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-muted">{facility.note}</p> : null}
          </article>
        ))}
      </div>
      <p className="text-sm text-muted">
        Unrestricted cash{" "}
        <SourceA source={capital.cash.unrestricted.source} sources={sources}>
          ${formatNumber(capital.cash.unrestricted.value, 1)} million
        </SourceA>
        . Restricted cash{" "}
        <SourceA source={capital.cash.restricted.source} sources={sources}>
          ${formatNumber(capital.cash.restricted.value, 1)} million
        </SourceA>
        . {capital.cash.restricted.note}
      </p>
    </section>
  );
}

function CapitalField({ label, children }: { label: string; children: ReactNode }) {
  return <div className="min-w-0"><dt className="mb-1 text-xs text-muted">{label}</dt><dd className="break-words font-mono text-xs leading-relaxed tabular-nums sm:text-sm">{children}</dd></div>;
}
