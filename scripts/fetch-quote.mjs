#!/usr/bin/env node
/**
 * Daily NBIS closes from a key-gated free API.
 * Finnhub: FINNHUB_API_KEY. Alpha Vantage: ALPHAVANTAGE_API_KEY.
 * Does not scrape Yahoo, Nasdaq, or Stooq. Stooq's robots.txt disallows general crawlers.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "data/market/quotes.json");
const finnhub = process.env.FINNHUB_API_KEY;
const alpha = process.env.ALPHAVANTAGE_API_KEY;
let points = [];
let sourceUrl = null;
let sourceTitle = null;

if (finnhub) {
  const to = Math.floor(Date.now() / 1000);
  const from = to - 400 * 24 * 3600;
  sourceUrl = "https://finnhub.io/api/v1/stock/candle";
  sourceTitle = "Finnhub daily candles for NBIS";
  const url = `${sourceUrl}?symbol=NBIS&resolution=D&from=${from}&to=${to}&token=${finnhub}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error("Finnhub", res.status);
    process.exit(1);
  }
  const body = await res.json();
  if (body.s !== "ok") {
    console.error(body);
    process.exit(1);
  }
  points = body.t.map((t, i) => ({
    date: new Date(t * 1000).toISOString().slice(0, 10),
    close: body.c[i],
  }));
} else if (alpha) {
  sourceUrl = "https://www.alphavantage.co/query";
  sourceTitle = "Alpha Vantage TIME_SERIES_DAILY for NBIS";
  const url = `${sourceUrl}?function=TIME_SERIES_DAILY&symbol=NBIS&outputsize=full&apikey=${alpha}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error("Alpha Vantage", res.status);
    process.exit(1);
  }
  const body = await res.json();
  const series = body["Time Series (Daily)"];
  if (!series) {
    console.error(body);
    process.exit(1);
  }
  points = Object.entries(series)
    .map(([date, row]) => ({ date, close: Number(row["4. close"]) }))
    .sort((a, b) => a.date.localeCompare(b.date));
} else {
  console.log("No FINNHUB_API_KEY or ALPHAVANTAGE_API_KEY. Quote file left unchanged.");
  process.exit(0);
}

const doc = {
  schemaVersion: 1,
  symbol: "NBIS",
  retrievedAt: new Date().toISOString(),
  sourceUrl,
  sourceTitle,
  currency: "USD",
  points,
  note: "Daily closes from the configured quote API. Not a real-time feed.",
};
await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(doc, null, 2));
console.log(`quotes ${points.length}, last ${points.at(-1)?.date} ${points.at(-1)?.close}`);
