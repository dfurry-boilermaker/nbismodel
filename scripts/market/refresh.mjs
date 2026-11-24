import { readFile, writeFile } from "node:fs/promises";
import YahooFinance from "yahoo-finance2";

const start = Number(process.env.SESSION_START);
const end = Number(process.env.SESSION_END);
const now = Math.floor(Date.now() / 1000);
if (!(start <= now && now < end + 1800)) process.exit(0);
const slot = Math.min(end, start + Math.floor((now - start) / 1800) * 1800);
const output = process.argv[2];
const previous = await readFile(output, "utf8").then(JSON.parse).catch(error => {
  if (error.code !== "ENOENT") throw error;
  return null;
});
if (previous?.slot >= slot) process.exit(0);

const yahoo = new YahooFinance();
const quote = await yahoo.quote("NBIS");
const tradedAt = quote.regularMarketTime?.getTime() / 1000;
if (quote.symbol !== "NBIS" || quote.currency !== "USD" ||
    !(quote.regularMarketPrice > 0 && Number.isFinite(quote.regularMarketPrice)) ||
    !(start <= tradedAt && tradedAt <= Math.min(now, end)) ||
    (previous && Date.parse(previous.asOf) > tradedAt * 1000)) {
  throw new Error("Yahoo has no valid NBIS trade for this session");
}
const today = new Date(start * 1000).toISOString().slice(0, 10);
let points = previous?.points ?? [];
if (!points.length || previous?.historyDate !== today || slot === end) {
  const chart = await yahoo.chart("NBIS", {
    period1: new Date((start - 100 * 86400) * 1000), interval: "1d"
  });
  const complete = chart.quotes.filter(row =>
    Number.isFinite(row.close) && row.close > 0 &&
    (row.date.toISOString().slice(0, 10) < today ||
      (slot === end && row.date.toISOString().slice(0, 10) === today))
  );
  if (complete.length < 20) throw new Error("Insufficient completed daily closes");
  points = complete.map(row => ({date: row.date.toISOString().slice(0, 10), close: row.close}));
}
await writeFile(output, JSON.stringify({
  symbol: "NBIS", currency: "USD", price: quote.regularMarketPrice,
  asOf: new Date(tradedAt * 1000).toISOString(), slot, historyDate: today, points
}) + "\n");
