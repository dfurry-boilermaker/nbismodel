#!/usr/bin/env node
/**
 * Models Nebius serves on OpenRouter, with other providers of the same model.
 * Public API: https://openrouter.ai/api/v1/models and /models/{id}/endpoints
 * robots.txt allows these paths.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "data/pricing/openrouter.json");
const headers = { "User-Agent": "nbismodel-research", Accept: "application/json" };

async function getJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

const list = await getJson("https://openrouter.ai/api/v1/models");
const ids = (list.data ?? []).map((m) => m.id);
const retrievedAt = new Date().toISOString();
const models = [];
let cursor = 0;
const queue = ids.slice();
async function worker() {
  while (queue.length) {
    const id = queue.shift();
    cursor += 1;
    try {
      const body = await getJson(`https://openrouter.ai/api/v1/models/${id}/endpoints`);
      const endpoints = body.data?.endpoints ?? [];
      const nebius = endpoints.filter((e) => /nebius/i.test(e.provider_name ?? ""));
      if (!nebius.length) continue;
      const slim = (e) => ({
        provider: e.provider_name,
        name: e.name,
        tag: e.tag ?? null,
        quantization: e.quantization ?? null,
        contextLength: e.context_length ?? null,
        promptPerToken: e.pricing?.prompt != null ? Number(e.pricing.prompt) : null,
        completionPerToken: e.pricing?.completion != null ? Number(e.pricing.completion) : null,
        cacheReadPerToken: e.pricing?.input_cache_read != null ? Number(e.pricing.input_cache_read) : null,
        discount: e.pricing?.discount ?? null,
        latencyLast30m: e.latency_last_30m ?? null,
        throughputLast30m: e.throughput_last_30m ?? null,
        uptimeLast1d: e.uptime_last_1d ?? null,
        status: e.status ?? null,
      });
      models.push({
        id,
        name: nebius[0].model_name ?? id,
        nebius: nebius.map(slim),
        otherProviders: endpoints.filter((e) => !/nebius/i.test(e.provider_name ?? "")).map(slim),
      });
    } catch (error) {
      console.error("skip", id, error.message);
    }
    if (cursor % 80 === 0) console.log(`scanned ${cursor}/${ids.length}, nebius models ${models.length}`);
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
models.sort((a, b) => a.name.localeCompare(b.name));

let existing = { history: [] };
try {
  existing = JSON.parse(await readFile(OUT, "utf8"));
} catch {
  /* first run */
}
const history = (existing.history ?? []).filter(s => s.retrievedAt.slice(0, 10) !== retrievedAt.slice(0, 10));
if (!models.length) throw new Error("No Nebius endpoints retrieved; preserving previous snapshot");
history.push({
  retrievedAt,
  modelCount: models.length,
  prices: models.map((m) => ({
    id: m.id,
    promptPerToken: m.nebius[0]?.promptPerToken ?? null,
    completionPerToken: m.nebius[0]?.completionPerToken ?? null,
  })),
});

const doc = {
  schemaVersion: 1,
  sourceUrl: "https://openrouter.ai/api/v1/models",
  endpointsUrlTemplate: "https://openrouter.ai/api/v1/models/{id}/endpoints",
  retrievedAt,
  note: "Prompt and completion prices are USD per token, as returned by OpenRouter. Latency and throughput are included only when the endpoint payload has them. History stores Nebius prompt and completion prices so the page can show a trend once more than one snapshot exists.",
  models,
  history,
};
await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(doc, null, 2));
console.log(`openrouter nebius models ${models.length}, history ${history.length}`);
