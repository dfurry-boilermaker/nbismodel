import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Footer, Header } from "@/components/site-chrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nebius model — NBIS guidance and reported results",
  description:
    "A public, sourced model of Nebius Group (NASDAQ: NBIS): reported financials, guidance versus actuals, data centers, and public prices.",
  icons: {
    icon: [{ url: "/favicon.webp?v=c2a724d53f39", type: "image/webp", sizes: "640x640" }],
    apple: [{ url: "/apple-icon.png?v=c2a724d53f39", type: "image/png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Header />
        <main id="main-content" className="site-width app-main">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
