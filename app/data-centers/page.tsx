import Image from "next/image";
import { DcMap } from "@/components/dc-map";
import { SourceA } from "@/components/metric-value";
import { centers } from "@/lib/load";

export const metadata = { title: "Data centers — Nebius model" };

export default function DataCentersPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold text-accent">Data centers</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Sites named by Nebius in shareholder letters, the March 5, 2025 capacity post, or the
          live AI Cloud regions document retrieved November 23, 2026. Megawatts are blank when
          the company did not state them. Secondary catalogs that publish their own megawatt
          guesses are not used.
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
              {["Site", "Relationship", "Status", "Capacity", "Dates", "Sources"].map((heading) => (
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
                </td>
                <td className="px-3 py-3 text-muted">{site.relationship}</td>
                <td className="px-3 py-3">{site.status}</td>
                <td className="px-3 py-3">{site.capacity}</td>
                <td className="px-3 py-3 text-muted">{site.dates}</td>
                <td className="px-3 py-3">
                  {site.sources.map((id) => (
                    <div key={id}>
                      <SourceA source={id} sources={centers.sources}>
                        {centers.sources[id]?.title ?? id}
                      </SourceA>
                    </div>
                  ))}
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
