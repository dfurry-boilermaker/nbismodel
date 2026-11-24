import { openRouter } from "@/lib/load";
import { formatPerMillion } from "@/lib/utils";

export const metadata = { title: "OpenRouter — Nebius model" };

type Endpoint = {
  provider: string;
  quantization: string | null;
  contextLength: number | null;
  promptPerToken: number | null;
  completionPerToken: number | null;
  latencyLast30m: number | null;
  throughputLast30m: number | null;
  uptimeLast1d: number | null;
};

export default function OpenRouterPage() {
  const models = openRouter.models as {
    id: string;
    name: string;
    nebius: Endpoint[];
    otherProviders: Endpoint[];
  }[];
  return (
    <div className="space-y-6">
      <header>
        <div className="eyebrow">/ 04.3 / OpenRouter</div>
        <h1 className="text-3xl font-semibold text-accent">OpenRouter</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Retrieved {openRouter.retrievedAt}. Nebius is a provider on {models.length} models in
          the public{" "}
          <a href="https://openrouter.ai/api/v1/models">models API</a>, confirmed through each
          model&apos;s{" "}
          <a href="https://openrouter.ai/docs/api/api-reference/endpoints/list-endpoints">
            endpoints
          </a>{" "}
          payload. Prices below are converted from USD per token to USD per million tokens.
          History points stored: {openRouter.history.length}. Latency and throughput were null
          on every Nebius endpoint in this snapshot, so those columns say so instead of showing
          a made-up speed.
        </p>
      </header>
      <div className="space-y-4">
        {models.map((model) => {
          const neb = model.nebius[0];
          const peers = [...model.otherProviders].sort(
            (a, b) => (a.promptPerToken ?? Infinity) - (b.promptPerToken ?? Infinity),
          );
          const cheaper = peers.filter(
            (peer) =>
              neb?.promptPerToken != null &&
              peer.promptPerToken != null &&
              peer.promptPerToken < neb.promptPerToken,
          ).length;
          return (
            <article key={model.id} className="rounded-xl border border-line p-3">
              <h2 className="font-medium">{model.name}</h2>
              <p className="font-mono text-xs text-muted">{model.id}</p>
              {neb ? (
                <p className="mt-2 text-sm">
                  Nebius: {formatPerMillion(neb.promptPerToken ?? 0)} in /{" "}
                  {formatPerMillion(neb.completionPerToken ?? 0)} out per million tokens.
                  Context {neb.contextLength?.toLocaleString() ?? "—"}. Quantization{" "}
                  {neb.quantization ?? "—"}. Uptime, last day:{" "}
                  {neb.uptimeLast1d == null ? "not reported" : `${neb.uptimeLast1d.toFixed(2)}%`}.
                  Latency, 30 minutes: {neb.latencyLast30m == null ? "not reported" : neb.latencyLast30m}.
                  Throughput, 30 minutes: {neb.throughputLast30m == null ? "not reported" : neb.throughputLast30m}.
                  {peers.length ? ` ${cheaper} of ${peers.length} other endpoints have a lower prompt price.` : " No other provider was listed."}
                </p>
              ) : null}
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-xs">
                  <thead className="text-muted">
                    <tr>
                      {["Provider", "Prompt / 1M", "Output / 1M", "Context", "Quant.", "Latency 30m", "Throughput 30m"].map((h) => (
                        <th key={h} className="px-2 py-1 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...model.nebius, ...peers].map((endpoint) => (
                      <tr key={`${endpoint.provider}-${endpoint.quantization}`} className="border-t border-line/70">
                        <td className="px-2 py-1">{endpoint.provider}</td>
                        <td className="px-2 py-1 font-mono">{endpoint.promptPerToken == null ? "—" : formatPerMillion(endpoint.promptPerToken)}</td>
                        <td className="px-2 py-1 font-mono">{endpoint.completionPerToken == null ? "—" : formatPerMillion(endpoint.completionPerToken)}</td>
                        <td className="px-2 py-1">{endpoint.contextLength?.toLocaleString() ?? "—"}</td>
                        <td className="px-2 py-1">{endpoint.quantization ?? "—"}</td>
                        <td className="px-2 py-1">{endpoint.latencyLast30m ?? "not reported"}</td>
                        <td className="px-2 py-1">{endpoint.throughputLast30m ?? "not reported"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
