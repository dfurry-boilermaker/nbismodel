import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer, Header } from "@/components/site-chrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nebius model — NBIS guidance and reported results",
  description:
    "A public, sourced model of Nebius Group (NASDAQ: NBIS): reported financials, guidance versus actuals, data centers, and public prices.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "64x64" }],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
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
