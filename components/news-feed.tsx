import Link from "next/link";
import data from "@/data/news.json";

type NewsItem = {
  id: string; date: string; dateLabel?: string; category: string; status: string;
  impact: string; title: string; summary: string; quote?: string; attribution?: string;
  why: string; watch: string; sources: {label: string; url: string}[];
};
const items: NewsItem[] = [...data.items].sort((a,b) => b.date.localeCompare(a.date));
const formatDate = (date: string) => new Intl.DateTimeFormat("en-US", {year:"numeric", month:"short", day:"numeric", timeZone:"UTC"}).format(new Date(date + "T00:00:00Z"));

function NewsCard({item, compact}: {item: NewsItem; compact: boolean}) {
  return (
    <article id={compact ? undefined : item.id} className="min-w-0 border border-line bg-panel p-4 sm:p-6 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-muted">
        <time dateTime={item.date}>{item.dateLabel ?? formatDate(item.date)}</time>
        <span>{item.category}</span>
        <span className={item.impact === "Positive" ? "text-good" : item.impact === "Mixed" ? "text-amber" : "text-bad"}>{item.impact} signal</span>
      </div>
      <span className="self-start border border-line px-2 py-1 text-xs text-muted">{item.status}</span>
      <h3 className="break-words text-xl leading-tight">{item.title}</h3>
      {item.quote && <blockquote className="border-l-2 border-good pl-3 text-base"><p>“{item.quote}”</p><footer className="mt-1 text-xs text-muted">{item.attribution}</footer></blockquote>}
      <p className="text-sm leading-relaxed text-muted">{item.summary}</p>
      <div className="text-sm leading-relaxed"><span className="font-medium text-good">Why it matters: </span>{item.why}</div>
      <div className="text-sm leading-relaxed text-muted"><span className="font-medium text-foreground">What to watch: </span>{item.watch}</div>
      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-3">
        {item.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="break-words text-xs underline text-muted hover:text-good">{source.label} ↗</a>)}
        {compact && <Link href={`/news#${item.id}`} className="text-xs underline">Full entry ↗</Link>}
      </div>
    </article>
  );
}

export function NewsFeed({compact = false}: {compact?: boolean}) {
  const visible = compact ? items.slice(0, 3) : items;
  return (
    <section aria-labelledby="market-news-title" className="min-w-0 space-y-4">
      {compact && <div className="section-heading flex-wrap"><h2 id="market-news-title">Market intelligence</h2><Link href="/news" className="text-link">All news ↗</Link></div>}
      {!compact && <h2 id="market-news-title" className="text-2xl">Latest research signals</h2>}
      <div className="section-label flex-wrap"><span>/ Curated news &amp; customer signals</span><span>Reviewed {formatDate(data.asOf)} · not live</span></div>
      <div className={compact ? "grid min-w-0 gap-3 lg:grid-cols-3" : "grid min-w-0 gap-3 md:grid-cols-2"}>
        {visible.map(item => <NewsCard key={item.id} item={item} compact={compact} />)}
      </div>
      <p className="text-xs leading-relaxed text-muted">Impact labels and implications are independent research judgments, not predictions of price movement. Social commentary is distinguished from disclosed contracts. No news entry automatically changes valuation inputs.</p>
      {!compact && <a href="https://nebius.com/newsroom" target="_blank" rel="noopener noreferrer" className="text-sm underline text-muted">Official Nebius newsroom ↗</a>}
    </section>
  );
}
