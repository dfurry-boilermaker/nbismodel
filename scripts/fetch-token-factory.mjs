#!/usr/bin/env node
/** Token Factory public catalog. robots.txt allows /api/public/models_info only. */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const SOURCE = "https://tokenfactory.nebius.com/api/public/models_info";
const OUT = path.join(process.cwd(), "data/pricing/token-factory.json");
const res = await fetch(SOURCE, { headers: { "User-Agent": "nbismodel-research", Accept: "application/json" } });
if (!res.ok) {
  console.error(res.status);
  process.exit(1);
}
const raw = await res.json();
const retrievedAt = new Date().toISOString().slice(0, 10);
const models = raw.map((m) => ({
  name: m.name,
  vendor: m.vendor,
  type: m.type,
  status: m.status,
  flavors: (m.flavors ?? []).map((f) => ({
    modelId: f.model_id,
    label: f.label,
    regions: (f.regions ?? []).map((r) => r.name),
    contextWindowK: f.context_window_k,
    quantization: f.quantization,
    tokensPerSecond: f.tokens_per_second,
    inputUsdPerMillion: f.input_price_per_million_tokens,
    cachedInputUsdPerMillion: f.input_cached_price_per_million_tokens,
    outputUsdPerMillion: f.output_price_per_million_tokens,
    deprecated: f.deprecated,
  })),
}));
if (!models.length || !models.some(m => m.flavors.length)) throw new Error("Empty catalog; preserving previous snapshot");
let existing = { snapshots: [] };
try {
  existing = JSON.parse(await readFile(OUT, "utf8"));
} catch {
  /* first */
}
const snapshots = existing.snapshots ?? [];
if (snapshots.at(-1)?.retrievedAt === retrievedAt) snapshots.pop();
snapshots.push({ retrievedAt, models });
const doc = {
  schemaVersion: 1,
  sourceUrl: SOURCE,
  sourceTitle: "Nebius Token Factory public model catalog",
  retrievedAt,
  notes: [
    "Prices are USD per million tokens from the public catalog fields.",
    "tokens_per_second is the catalog field. Embedding models may report 0.",
    "History starts when this script first ran. The API does not provide older prices.",
  ],
  snapshots,
};
await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(doc, null, 2));
console.log(`token factory models ${models.length}, snapshots ${snapshots.length}`);
