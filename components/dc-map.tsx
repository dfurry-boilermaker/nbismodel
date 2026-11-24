"use client";

import type { DataCenter } from "@/lib/types";

function stackedOffset(sites: DataCenter[], index: number): number {
  const panel = sites;
  const site = panel[index];
  const pin = site.pin!;
  let offset = 0;
  for (let earlier = 0; earlier < index; earlier += 1) {
    const other = panel[earlier].pin!;
    const close = Math.abs(other.lat - pin.lat) < 1.2 && Math.abs(other.lon - pin.lon) < 4;
    if (close) offset += 12;
  }
  return offset;
}

const PANELS = [
  { id: "europe", title: "Europe and the North Atlantic", minLon: -30, maxLon: 40, minLat: 35, maxLat: 72 },
  { id: "america", title: "North America", minLon: -125, maxLon: -70, minLat: 24, maxLat: 55 },
];

export function DcMap({ sites }: { sites: DataCenter[] }) {
  const pinned = sites.filter((site) => site.pin);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {PANELS.map((panel) => {
        const inside = pinned.filter((site) => {
          const pin = site.pin!;
          return (
            pin.lon >= panel.minLon &&
            pin.lon <= panel.maxLon &&
            pin.lat >= panel.minLat &&
            pin.lat <= panel.maxLat
          );
        });
        return (
          <div key={panel.id} className="rounded-lg border border-line bg-panel p-3">
            <h3 className="text-sm font-medium">{panel.title}</h3>
            <p className="mb-2 text-xs text-muted">
              Locator only. City pins are centroids.
              {panel.id === "europe" ? " The amber pin is the Mäntsälä facility, not a city center." : ""}
            </p>
            <svg viewBox="0 0 320 200" className="h-auto w-full rounded bg-[#061725]">
              <defs><pattern id={`map-grid-${panel.id}`} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#2d4454" strokeWidth="0.5" /></pattern></defs>
              <rect width="320" height="200" fill={`url(#map-grid-${panel.id})`} />
              {inside.map((site, index) => {
                const pin = site.pin!;
                const x = ((pin.lon - panel.minLon) / (panel.maxLon - panel.minLon)) * 300 + 10;
                const y = ((panel.maxLat - pin.lat) / (panel.maxLat - panel.minLat)) * 180 + 10;
                const facility = pin.precision.startsWith("Facility");
                const labelY = y + index * 0 + stackedOffset(inside, index);
                return (
                  <g key={site.id}>
                    <circle cx={x} cy={y} r={facility ? 5 : 3.5} fill={facility ? "#f4ca83" : "#c1ed86"} />
                    {Math.abs(labelY - y) > 8 ? (
                      <line x1={x} y1={y} x2={x + 8} y2={labelY} stroke="#91a6b9" strokeWidth="0.6" />
                    ) : null}
                    <text x={x + 8} y={labelY + 3} fill="#d6dce5" fontSize="9">
                      {site.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        );
      })}
    </div>
  );
}
