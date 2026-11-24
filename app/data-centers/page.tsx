import Image from "next/image";
import { DcMap } from "@/components/dc-map";
import { SourceA } from "@/components/metric-value";
import { centers } from "@/lib/load";

export const metadata = { title: "Data centers — Nebius model" };

export default function DataCentersPage() {
  return (
    <div className="space-y-8">
      <header>
        <div className="eyebrow">/ 03 / Infrastructure</div>
        <h1 className="text-3xl font-semibold text-accent">Data centers</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Sites named by Nebius in shareholder letters, the March 5, 2025 capacity post, the
          November 12, 2025 prospectus supplement, or the live AI Cloud regions document.
          Each site splits megawatts into contracted or planned, operational, and energized.
          A blank cell means that category was not disclosed for that site. Secondary catalogs
          are not used.
        </p>
        <p className="mt-3 rounded-md border border-amber/40 bg-amber/10 p-3 text-sm text-amber">
          {centers.imageryNote}
        </p>
      </header>
      <DcMap sites={centers.sites} />
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="bg-panel text-xs uppercase tracking-wide text-muted">
            <tr>
              {["Site", "Relationship", "Contracted or planned", "Operational", "Energized", "Dates"].map((heading) => (
                <th key={heading} className="px-3 py-2 font-medium">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {centers.sites.map((site) => (
              <tr key={site.id} id={site.id} className="border-t border-line align-top">
                <td className="px-3 py-3">
                  <div className="font-medium">{site.name}</div>
                  <div className="text-xs text-muted">{site.place}</div>
                  <div className="text-xs text-muted">
                    {site.cloudRegions.length ? site.cloudRegions.join(", ") : "No live region code"}
                  </div>
                  <div className="mt-1 text-xs">{site.status}</div>
                  <div className="mt-1 text-xs">
                    {site.sources.map((id) => (
                      <span key={id} className="mr-2">
                        <SourceA source={id} sources={centers.sources}>{centers.sources[id]?.date ?? id}</SourceA>
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3 text-muted">{site.relationship}</td>
                <Mw cell={site.mw.contractedOrPlanned} />
                <Mw cell={site.mw.operational} />
                <Mw cell={site.mw.energized} />
                <td className="px-3 py-3 text-muted">
                  {site.dates}
                  <span className="mt-1 block text-xs">{site.capacity}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="space-y-6">
        <h2 className="text-lg font-medium">Satellite timeline</h2>
        {centers.sites.filter((site) => site.scenes.length).map((site) => (
          <article key={site.id}>
            <h3 className="font-medium">{site.name}</h3>
            <p className="mt-1 text-sm text-muted">{site.notes}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {site.scenes.map((scene) => (
                <figure key={scene.itemId} className="rounded-lg border border-line bg-panel p-2">
                  <Image
                    src={scene.file}
                    alt={`Sentinel-2 view centered on ${site.name}, acquired ${scene.acquiredAt}`}
                    width={520}
                    height={520}
                    className="aspect-square h-auto w-full rounded object-cover"
                  />
                  <figcaption className="mt-2 text-xs leading-5 text-muted">
                    Acquired {scene.acquiredAt}. Scene {scene.itemId}. Platform {scene.platform}.
                    Scene cloud cover {scene.cloudCoverPct == null ? "not reported" : `${scene.cloudCoverPct.toFixed(2)}%`}.
                    10 m pixels. Copernicus Sentinel-2 via Planetary Computer.
                  </figcaption>
                </figure>
              ))}
            </div>
          </article>
        ))}
        <p className="text-sm text-amber">
          Other sites have no image. A city-level picture would not be the data center, and
          those facilities do not have a published footprint in the sources reviewed.
        </p>
      </section>
    </div>
  );
}

function Mw({ cell }: { cell: { value: number | null; source: string; note: string } }) {
  return (
    <td className="px-3 py-3 align-top text-sm">
      {cell.value == null ? (
        <span className="text-amber">Not disclosed</span>
      ) : (
        <SourceA source={cell.source} sources={centers.sources}>{cell.value.toLocaleString("en-US")} MW</SourceA>
      )}
      <span className="mt-1 block text-xs text-muted">{cell.note}</span>
    </td>
  );
}
