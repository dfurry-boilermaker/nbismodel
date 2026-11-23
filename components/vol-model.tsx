"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { priceBand, realizedVol } from "@/lib/vol";

export function VolModel({
  closes,
  quoteNote,
  quoteAsOf,
}: {
  closes: number[];
  quoteNote: string;
  quoteAsOf: string | null;
}) {
  const realized = useMemo(() => realizedVol(closes), [closes]);
  const last = closes.at(-1) ?? null;
  const [price, setPrice] = useState(last ? String(last) : "");
  const [vol, setVol] = useState(realized ? String(realized) : "");
  const [days, setDays] = useState("5");
  const [implied, setImplied] = useState("");

  const realizedBand = useMemo(() => {
    const p = Number(price);
    const v = Number(vol);
    const h = Number(days);
    if (!p || !v || !h) return null;
    return priceBand({ price: p, annualVol: v, horizonDays: h, z: 1.96 });
  }, [price, vol, days]);
  const impliedBand = useMemo(() => {
    const p = Number(price);
    const v = Number(implied);
    const h = Number(days);
    if (!p || !v || !h) return null;
    return priceBand({ price: p, annualVol: v, horizonDays: h, z: 1.96 });
  }, [price, implied, days]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        A 95% band under a lognormal model with zero drift: price × exp(±1.96 × annual
        volatility × sqrt(days / 252)). Trading days use 252. This is not a directional
        forecast. {quoteNote}
      </p>
      {closes.length < 20 ? (
        <p className="rounded-md border border-amber/40 bg-amber/10 p-3 text-sm text-amber">
          Realized volatility needs at least 20 daily closes in data/market/quotes.json.
          That file is empty until a quote API key is configured. You can type a price and
          a volatility below to run the arithmetic. Typed values are not saved and are not
          market data.
        </p>
      ) : (
        <p className="text-sm">
          Realized volatility from {closes.length} closes
          {quoteAsOf ? `, retrieved ${quoteAsOf}` : ""}: {realized ? `${(realized * 100).toFixed(1)}%` : "—"}.
          Last close in the file: {last}.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Price" value={price} onChange={setPrice} />
        <Field label="Realized vol, decimal" value={vol} onChange={setVol} />
        <Field label="Implied vol, decimal" value={implied} onChange={setImplied} />
        <Field label="Horizon, trading days" value={days} onChange={setDays} />
      </div>
      <p className="text-xs text-muted">
        Implied volatility is blank because this site has no options feed. Leave it blank,
        or type a figure you sourced yourself.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Band title="Realized-vol band" band={realizedBand} />
        <Band title="Implied-vol band" band={impliedBand} />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} inputMode="decimal" />
    </label>
  );
}

function Band({
  title,
  band,
}: {
  title: string;
  band: ReturnType<typeof priceBand> | null;
}) {
  return (
    <div className="rounded-lg border border-line bg-panel p-3">
      <div className="text-xs uppercase tracking-wide text-muted">{title}</div>
      {!band ? (
        <p className="mt-2 text-sm text-amber">Waiting on inputs.</p>
      ) : "error" in band ? (
        <p className="mt-2 text-sm text-bad">{band.error}</p>
      ) : (
        <p className="mt-2 font-mono text-lg">
          {band.low.toFixed(2)} – {band.high.toFixed(2)}
          <span className="mt-1 block text-xs text-muted">
            Horizon sigma {(band.sigmaHorizon * 100).toFixed(1)}%
          </span>
        </p>
      )}
    </div>
  );
}
