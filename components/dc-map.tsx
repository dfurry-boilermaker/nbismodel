"use client";

import { useState } from "react";
import type { DataCenter } from "@/lib/types";

// Label anchors inside the disclosed region. These are never facility coordinates.
const regionAnchors: Record<string, [number, number]> = {
  "mantasala-2": [60.63, 25.27], "finland-310": [64, 26], "new-jersey": [40.1, -74.6],
  uk: [54, -2], israel: [31.5, 35], alabama: [32.8, -86.8], oklahoma: [35.5, -97.5],
  pennsylvania: [41, -77.7], "south-carolina": [33.8, -80.9], estonia: [58.7, 25.5],
  alberta: [54, -115], india: [22, 79],
};

export function DcMap({ sites }: { sites: DataCenter[] }) {
  const [selectedId, select] = useState(sites[0]?.id);
  const selected = sites.find(site => site.id === selectedId);
  if (!selected) return null;
  // Paint the selected marker last so neighboring sites can always be inspected.
  const ordered = [...sites.filter(site => site !== selected), selected];
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-panel">
      <div className="grid items-center gap-4 p-5 lg:grid-cols-[1fr_auto]">
        <h2 className="text-2xl">Global data center footprint</h2>
        <label className="flex flex-wrap items-center gap-2 text-sm">Explore a location
          <select className="max-w-full rounded border border-line bg-background p-2" value={selectedId} onChange={event => select(event.target.value)}>
            {sites.map(site => <option key={site.id} value={site.id}>{site.name}</option>)}
          </select>
        </label>
      </div>
      <svg viewBox="0 0 720 360" role="group" aria-label="World map of disclosed locations" className="block w-full bg-[#081a29]">
        <image href="/world-land.svg" width="720" height="360" />
        {ordered.map(site => {
          const location = site.pin ? [site.pin.lat, site.pin.lon] : regionAnchors[site.id];
          if (!location) return null;
          const [lat, lon] = location;
          const active = site === selected;
          const color = site.pin?.precision.startsWith("Facility") ? "#f4ca83" : site.pin ? "#c1ed86" : "#a3d7d5";
          return <g key={site.id} transform={`translate(${2 * (180 + lon)} ${2 * (90 - lat)})`}
            role="button" tabIndex={0} aria-label={site.name} aria-pressed={active}
            className="cursor-pointer" onClick={() => select(site.id)} onKeyDown={event => {
              if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(site.id); }
            }}>
            <title>{site.name}</title>
            <circle r="6" fill="transparent" />
            {active && <circle r="7" stroke="white" fill="none" />}
            <circle r="3" stroke={color} strokeWidth="1.2" fill={site.pin ? color : "#081a29"} />
          </g>;
        })}
      </svg>
      <div className="grid gap-4 border-t border-line p-5 sm:grid-cols-2">
        <div><p className="text-xs text-muted">Gold · facility　 Green · city or town　 Open circle · disclosed area</p>
          <p className="mt-2 text-xs text-muted">Nearby locations can overlap. Use the selector to inspect each entry. Basemap by Natural Earth.</p></div>
        <div aria-live="polite"><a className="font-medium underline" href={`#${selected.id}`}>{selected.name} ↓</a>
          <p className="mt-1 text-sm text-muted">{selected.pin?.precision ?? (regionAnchors[selected.id] ? "Approximate area marker for " + selected.place + ". Facility coordinates are unverified." : "Location coordinates unavailable.")}</p>
          <p className="mt-1 text-sm">{selected.status}</p></div>
      </div>
    </section>
  );
}
