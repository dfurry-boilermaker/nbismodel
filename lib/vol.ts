export type VolInput = {
  price: number;
  annualVol: number;
  horizonDays: number;
  z: number;
};

export type VolBand = {
  low: number;
  high: number;
  sigmaHorizon: number;
};

/** Zero-drift lognormal band. annualVol is a decimal, for example 0.8 for 80%. */
export function priceBand(input: VolInput): VolBand | { error: string } {
  if (input.price <= 0 || input.annualVol <= 0 || input.horizonDays <= 0) {
    return { error: "Price, volatility, and horizon all have to be positive." };
  }
  const sigmaHorizon = input.annualVol * Math.sqrt(input.horizonDays / 252);
  const move = Math.exp(input.z * sigmaHorizon);
  return {
    low: input.price / move,
    high: input.price * move,
    sigmaHorizon,
  };
}

export function realizedVol(closes: number[]): number | null {
  if (closes.length < 20) return null;
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i += 1) {
    if (closes[i - 1] <= 0 || closes[i] <= 0) continue;
    returns.push(Math.log(closes[i] / closes[i - 1]));
  }
  if (returns.length < 19) return null;
  const mean = returns.reduce((s, v) => s + v, 0) / returns.length;
  const variance =
    returns.reduce((s, v) => s + (v - mean) ** 2, 0) / (returns.length - 1);
  return Math.sqrt(variance) * Math.sqrt(252);
}
