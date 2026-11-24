import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Disclaimer, Footer, Header } from "@/components/site-chrome";
import "./globals.css";

const sans = IBM_Plex_Sans({
  variable: "--font-ibm",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Nebius model — NBIS guidance and reported results",
  description:
    "A public, sourced model of Nebius Group (NASDAQ: NBIS): reported financials, guidance versus actuals, data centers, and public prices.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        <div className="border-b border-amber/30 bg-amber/10">
          <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            <Disclaimer />
          </div>
        </div>
        <Header />
        <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8 sm:px-6">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
