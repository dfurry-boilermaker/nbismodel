import Link from "next/link";

const LINKS = [
  ["Overview", "/"],
  ["Financials", "/financials"],
  ["Guidance", "/guidance"],
  ["Data centers", "/data-centers"],
  ["Pricing", "/pricing"],
  ["Models", "/models"],
  ["Methodology", "/methodology"],
];

export function Disclaimer() {
  return (
    <p className="text-[12px] leading-5 text-amber">
      Informational and educational only. Not investment advice, a solicitation, or a
      recommendation to buy or sell any security. Data may be delayed, incomplete, or wrong.
      The authors may hold positions in securities mentioned here. This site shows no private
      portfolio, holdings, or account information for anyone.
    </p>
  );
}

export function Header() {
  return (
    <header className="border-b border-line bg-background/95">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-baseline justify-between gap-4">
          <Link href="/" className="no-underline">
            <span className="font-mono text-xs tracking-[0.22em] text-muted">NASDAQ: NBIS</span>
            <span className="mt-0.5 block text-lg font-semibold text-accent">Nebius model</span>
          </Link>
          <p className="hidden text-right text-xs text-muted sm:block">
            Public tracker for Nebius Group
            <br />
            guidance versus what it reports
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-1 text-sm">
          {LINKS.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 rounded-md px-2.5 py-1 text-foreground/85 no-underline hover:bg-white/5"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Disclaimer />
      </div>
    </footer>
  );
}
