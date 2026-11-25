import { FactoryCharts } from "@/components/pricing-dashboard";
import { tokenFactory } from "@/lib/load";

export const metadata = { title: "Token Factory — Nebius model" };

export default function TokenFactoryPage() {
  const snapshot = tokenFactory.snapshots.at(-1);
  return (
    <div className="space-y-6">
      <header>
        <div className="eyebrow">/ 04.2 / Token Factory</div>
        <h1 className="text-3xl font-semibold text-accent">Token Factory</h1>
        <p className="mt-3 text-sm text-muted">
          Retrieved {tokenFactory.retrievedAt} from{" "}
          <a href={tokenFactory.sourceUrl}>{tokenFactory.sourceTitle}</a>. Snapshots:{" "}
          {tokenFactory.snapshots.length}. Prices are USD per million tokens.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
          {tokenFactory.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </header>
      <FactoryCharts />
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase tracking-wide text-muted">
            <tr>
              {["Model", "Vendor", "Input", "Cached input", "Output", "Tokens/sec", "Context, K", "Regions"].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(snapshot?.models ?? []).map((model) =>
              model.flavors.map((flavor) => (
                <tr key={flavor.modelId} className="border-t border-line">
                  <td className="px-3 py-2">
                    {model.name}
                    <span className="block font-mono text-[11px] text-muted">{flavor.modelId}</span>
                  </td>
                  <td className="px-3 py-2">{model.vendor}</td>
                  <td className="px-3 py-2 font-mono">{money(flavor.inputUsdPerMillion)}</td>
                  <td className="px-3 py-2 font-mono">{money(cached(flavor))}</td>
                  <td className="px-3 py-2 font-mono">{money(flavor.outputUsdPerMillion)}</td>
                  <td className="px-3 py-2 font-mono">
                    {flavor.tokensPerSecond ? flavor.tokensPerSecond : <span className="text-amber">0 / n/a</span>}
                  </td>
                  <td className="px-3 py-2">{flavor.contextWindowK ?? "—"}</td>
                  <td className="px-3 py-2 text-muted">{flavor.regions.join(", ") || "—"}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function money(value: number | null | undefined) {
  if (value == null) return "—";
  return `$${value}`;
}

function cached(flavor: object) {
  const value = (flavor as { cachedInputUsdPerMillion?: number | null }).cachedInputUsdPerMillion;
  return value ?? null;
}
