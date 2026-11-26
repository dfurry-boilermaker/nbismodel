import type { Metadata } from "next";
import { NewsFeed } from "@/components/news-feed";

export const metadata: Metadata = {
  title: "News & market intelligence | Nebius Model",
  description: "Source-linked Nebius news, customer commentary, product developments and investment implications."
};

export default function NewsPage() {
  return (
    <div className="min-w-0 space-y-8">
      <header>
        <div className="eyebrow">/ NBIS · Research desk</div>
        <h1>News &amp; signals.</h1>
        <p className="mt-4 text-muted">Follow customer endorsements, enterprise AI adoption, infrastructure delivery, financing and product releases. Each entry separates the reported evidence from our interpretation and the next milestone to watch.</p>
      </header>
      <NewsFeed />
    </div>
  );
}
