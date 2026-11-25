#!/usr/bin/env node
/**
 * Refresh Nebius AI Cloud GPU list prices from the public pricing markdown.
 * docs.nebius.com robots.txt allows this path. USD tables only.
 * Appends a snapshot. Does not invent reserved rates or peer prices.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const SOURCE = "https://docs.nebius.com/compute/resources/pricing.md";
const OUT = path.join(process.cwd(), "data/pricing/gpu.json");

const res = await fetch(SOURCE, {
  headers: { "User-Agent": "nbismodel-research", Accept: "text/markdown" },
});
if (!res.ok) {
  console.error("GPU pricing fetch failed", res.status);
  process.exit(1);
}
const md = await res.text();
const retrievedAt = new Date().toISOString().slice(0, 10);
const parts = md.split("\n#### ").slice(1);
const rows = [];
for (const part of parts) {
  const title = part.split("\n", 1)[0].trim();
  if (/^(Disk|Shared|Local|Non-GPU)/.test(title)) continue;
  const regionMatch = part.match(/available in the (.+?)\[/);
  const regionsNote = regionMatch ? regionMatch[1].replaceAll("`", "").trim() : "";
  const usd = part.split("> [tab] USD")[1];
  if (!usd) continue;
  const block = usd.split("> [tab] ILS")[0];
  for (const line of block.split("\n")) {
    if (!line.includes("GPU hour") && !line.includes("CPU hour") && !line.includes("GiB hour")) continue;
    const cells = line.split("|").map((c) => c.trim()).filter((c) => c && c !== ">");
    if (cells.length < 3) continue;
    const [item, price, per] = cells;
    const dollar = price.match(/\\\$([0-9]+(?:\.[0-9]+)?)/);
    if (!dollar) continue;
    const unit = per.includes("CPU") ? "cpu-hour" : per.includes("GiB") ? "gib-hour" : "gpu-hour";
    rows.push({
      sku: title,
      item: item.replaceAll("*", ""),
      priceUsd: Number(dollar[1]),
      unit,
      priceIsFloor: /from/i.test(price),
      term: /preempt/i.test(item) ? "preemptible" : "on-demand",
      regionsNote,
    });
  }
}
if (!rows.some((r) => r.unit === "gpu-hour" && r.term === "on-demand")) {
  console.error("No on-demand GPU rows parsed");
  process.exit(1);
}

let existing = { snapshots: [] };
try {
  existing = JSON.parse(await readFile(OUT, "utf8"));
} catch {
  /* first snapshot */
}
const snapshots = existing.snapshots ?? [];
if (snapshots.at(-1)?.retrievedAt === retrievedAt) snapshots.pop();
snapshots.push({ retrievedAt, sourceUrl: SOURCE.replace(/\.md$/, ""), rows });
const doc = {
  schemaVersion: 1,
  sourceUrl: "https://docs.nebius.com/compute/resources/pricing",
  sourceTitle: "Compute pricing in Nebius AI Cloud",
  retrievedAt,
  currency: "USD",
  notes: [
    "On-demand and preemptible USD rates from the compute pricing document. Shekel tables on the same page are omitted.",
    "Where the price cell says 'from', the number is a floor, not the current spot price. The document says spot prices are uncapped.",
    "L40S instances also bill CPU and RAM. Those lines are included so the GPU line is not read as an all-in price. NVLink GPU tables in this document list a GPU-hour rate only.",
    "No reserved or committed $/GPU-hour was in the document.",
    "nebius.com/prices names GB200 NVL72 and GB300 NVL72. This document did not list a $/GPU-hour for those rack SKUs.",
    "Peer list prices were not collected. Vendor pages were not scraped where robots.txt or the lack of an official price API made that a poor fit.",
  ],
  peers: [],
  snapshots,
};
await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(doc, null, 2));
console.log(`gpu rows ${rows.length}, snapshots ${snapshots.length}`);
