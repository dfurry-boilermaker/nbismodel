import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, digits = 1): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return value < 0 ? `(${formatted})` : formatted;
}

export function formatUsdMillions(value: number, digits = 1): string {
  return `$${formatNumber(value, digits)}m`;
}

export function formatCompactUsd(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  return `${sign}$${abs.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatPerMillion(usdPerToken: number): string {
  const perM = usdPerToken * 1_000_000;
  if (perM === 0) return "$0";
  if (perM < 0.01) return `$${perM.toFixed(4)}`;
  if (perM < 1) return `$${perM.toFixed(3)}`;
  return `$${perM.toFixed(2)}`;
}
