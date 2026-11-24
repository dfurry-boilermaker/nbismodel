"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Snapshot = {
  price: number;
  asOf: string;
  points: {date: string; close: number}[];
};
const MarketContext = createContext<Snapshot | null>(null);
const url = "https://raw.githubusercontent.com/dfurry-boilermaker/nbismodel/market-data/nbis.json";
export const useMarketQuote = () => useContext(MarketContext);

export function MarketProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      if (document.hidden) return;
      try {
        const res = await fetch(url, {signal: controller.signal});
        if (!res.ok) return;
        const data = await res.json();
        if (data.symbol === "NBIS" && data.currency === "USD" && Number.isFinite(data.price) &&
            data.price > 0 && Number.isFinite(Date.parse(data.asOf)) && Array.isArray(data.points)) {
          setSnapshot(old => old && Date.parse(old.asOf) > Date.parse(data.asOf) ? old : data);
        }
      } catch { /* Keep the last displayed quote when the cache is unavailable. */ }
    }
    void refresh();
    const timer = setInterval(refresh, 5 * 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return <MarketContext.Provider value={snapshot}>{children}</MarketContext.Provider>;
}

export function MarketPrice({ children }: { children: ReactNode }) {
  const quote = useMarketQuote();
  if (!quote) return children;
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short"
  }).format(new Date(quote.asOf));
  return <>
    <div className="feature-value">${quote.price.toFixed(2)}</div>
    <p className="feature-note">Yahoo Finance · <time dateTime={quote.asOf}>{time}</time>. Regular-session quote, refreshed every 30 minutes.</p>
  </>;
}
