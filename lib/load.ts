import financialsJson from "@/data/financials.json";
import guidanceJson from "@/data/guidance.json";
import centersJson from "@/data/data-centers.json";
import holdingsJson from "@/data/holdings.json";
import feedsJson from "@/data/feeds.json";
import quotesJson from "@/data/market/quotes.json";
import gpuJson from "@/data/pricing/gpu.json";
import tokenJson from "@/data/pricing/token-factory.json";
import openrouterJson from "@/data/pricing/openrouter.json";
import type {
  DataCentersFile,
  FeedsFile,
  FinancialsFile,
  GuidanceFile,
  HoldingsFile,
  QuoteFile,
} from "@/lib/types";

export const financials = financialsJson as FinancialsFile;
export const guidance = guidanceJson as GuidanceFile;
export const centers = centersJson as DataCentersFile;
export const holdings = holdingsJson as HoldingsFile;
export const feeds = feedsJson as FeedsFile;
export const quotes = quotesJson as QuoteFile;
export const gpuPrices = gpuJson;
export const tokenFactory = tokenJson;
export const openRouter = openrouterJson;

export function sourceOf(id: string) {
  return (
    financials.sources[id] ??
    guidance.sources[id] ??
    centers.sources[id] ??
    holdings.sources[id]
  );
}
