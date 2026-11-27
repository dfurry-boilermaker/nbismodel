import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer, Header } from "@/components/site-chrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nebius model — NBIS guidance and reported results",
  description:
    "A public, sourced model of Nebius Group (NASDAQ: NBIS): reported financials, guidance versus actuals, data centers, and public prices.",
  metadataBase: new URL("https://nbismodel.com"),
  icons: {
    icon: [{ url: "/nebius-icon.png", type: "image/png", sizes: "600x600" }],
    apple: [{ url: "/nebius-icon.png", type: "image/png", sizes: "600x600" }],
  },
  openGraph: {
    type: "website",
    siteName: "Nebius model — independent research",
    title: "Nebius model — independent NBIS research",
    description: "A public, independent model of Nebius Group: financials, guidance, valuation and data centers. Not affiliated with Nebius.",
    images: [{ url: "/nebius-icon.png", width: 600, height: 600, alt: "Nebius N mark" }],
  },
  twitter: {
    card: "summary",
    title: "Nebius model — independent NBIS research",
    description: "Independent financials, guidance and valuation research. Not affiliated with Nebius.",
    images: ["/nebius-icon.png"],
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
      </body>
    </html>
  );
}
