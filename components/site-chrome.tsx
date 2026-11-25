import Link from "next/link";
import { SiteNav } from "@/components/site-nav";

export function Disclaimer() {
  return (
    <p className="footer-disclaimer">
      Educational use only. Illustrative price targets and model scenarios are uncertain, not guarantees,
      ratings, investment advice, or offers to buy or sell any security. Prices are closing prices entered manually
      as of the date shown; not live; may be out of date. The authors may hold positions in
      securities mentioned here. Not affiliated with Nebius Group N.V.
    </p>
  );
}

export function Header() {
  return (
    <header className="site-header">
      <div className="site-width header-inner">
        <Link href="/" className="brand" aria-label="Nebius model home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 5h4v11H2zm6-3h4v14H8zm6 6h4v8h-4z" /></svg>
          </span>
          nbis<span>/model</span>
        </Link>
        <SiteNav />
        <a className="repo-link" href="https://github.com/dfurry-boilermaker/nbismodel" target="_blank" rel="noreferrer">[↗] Source</a>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-width">
        <div className="footer-top">
          <Link href="/" className="footer-title no-underline">Follow the fundamentals.</Link>
          <div className="footer-links">
            <Link href="/methodology">Methodology ↗</Link>
            <Link href="/disclaimer">Disclaimer ↗</Link>
            <a href="https://nebius.com/financials">Investor relations ↗</a>
            <a href="https://github.com/dfurry-boilermaker/nbismodel">GitHub ↗</a>
          </div>
        </div>
        <Disclaimer />
        <div className="footer-bottom">Independent research project / NASDAQ: NBIS / Not affiliated with Nebius Group N.V. Nebius is a trademark of its owner.</div>
      </div>
    </footer>
  );
}
