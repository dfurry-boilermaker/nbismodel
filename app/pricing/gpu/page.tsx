import { gpuPrices } from "@/lib/load";

export const metadata = { title: "GPU prices — Nebius model" };

export default function GpuPage() {
  const snapshot = gpuPrices.snapshots.at(-1);
  const rows = snapshot?.rows ?? [];
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-accent">GPU-hour list prices</h1>
        <p className="mt-3 text-sm text-muted">
          Retrieved {gpuPrices.retrievedAt} from{" "}
          <a href={gpuPrices.sourceUrl}>{gpuPrices.sourceTitle}</a>. Snapshots stored:{" "}
          {gpuPrices.snapshots.length}. A trend chart needs a second, different snapshot.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
          {gpuPrices.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </header>
      {gpuPrices.peers.length === 0 ? (
        <p className="rounded-md border border-amber/40 bg-amber/10 p-3 text-sm text-amber">
          Peer comparison is empty. CoreWeave, Lambda, and the hyperscalers were not scraped
          for this version. Where a public price API exists later, add it as its own fetcher
          and append rows with a source URL. Do not type prices from memory.
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase tracking-wide text-muted">
            <tr>
              {["SKU", "Line", "Term", "USD", "Unit", "Floor?", "Regions"].map((heading) => (
                <th key={heading} className="px-3 py-2 font-medium">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.sku}-${row.item}-${row.unit}-${row.term}`} className="border-t border-line">
                <td className="px-3 py-2">{row.sku}</td>
                <td className="px-3 py-2">{row.item}</td>
                <td className="px-3 py-2">{row.term}</td>
                <td className="px-3 py-2 font-mono">{row.priceUsd.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}</td>
                <td className="px-3 py-2">{row.unit}</td>
                <td className="px-3 py-2">{row.priceIsFloor ? "yes" : "no"}</td>
                <td className="px-3 py-2 text-muted">{row.regionsNote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
