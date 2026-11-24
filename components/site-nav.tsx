"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  ["O", "Overview", "/"], ["F", "Financials", "/financials"],
  ["G", "Guidance", "/guidance"], ["D", "Data centers", "/data-centers"],
  ["P", "Pricing", "/pricing"], ["M", "Models", "/models"],
  ["R", "Methodology", "/methodology"],
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="menu-toggle" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>
        {open ? "[−] Close" : "[+] Menu"}
      </button>
      <nav id="site-navigation" className="site-nav" data-open={open} aria-label="Main navigation">
        {LINKS.map(([key, label, href]) => {
          const active = href === "/" ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="nav-link" aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>
              <span className="nav-key" aria-hidden="true">[{key}]</span>{label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
