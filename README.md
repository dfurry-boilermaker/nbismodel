# Nebius model

A public site for [Nebius Group](https://nebius.com) (NASDAQ: NBIS). It tracks reported results against the company's own guidance, lists the data centers Nebius has described, and stores public prices for Token Factory, AI Cloud GPUs, and the models Nebius serves on OpenRouter.

It is informational. It is not investment advice. Nothing on the site is a private portfolio.

## Run it

```bash
npm install
npm run dev -- --port 3847
```

Open http://127.0.0.1:3847.

```bash
npm run validate
npm run build
npm start -- --port 3847
```

## Where the numbers live

Curated series are JSON in `data/`. Each figure points at a source id. The source map on that file has the URL and the document date.

| File | What it is |
| --- | --- |
| `data/financials.json` | Quarters since Q3 2024, plus annual segment lines from the FY 2025 Form 20-F |
| `data/guidance.json` | Guidance revisions and the actuals they are scored against |
| `data/data-centers.json` | Sites named by Nebius, with Sentinel-2 scenes where a facility coordinate exists |
| `data/holdings.json` | Avride, TripleTen, Toloka, ClickHouse |
| `data/pricing/` | Snapshots from OpenRouter, Token Factory, and the GPU price document |
| `data/market/quotes.json` | Daily NBIS closes, empty until a quote key is set |
| `data/feeds.json` | When each feed was last updated |

Nebius is a foreign private issuer, CIK `0001513845`. It files Forms 20-F and 6-K, not Forms 10-K or 10-Q. Quarterly figures come from the earnings PDFs linked on [nebius.com/financials](https://nebius.com/financials). If a later release recast a quarter, both the later figure and the first-reported figure are stored.

Blank cells are blank because the document did not state the number. Do not fill them with an estimate.

## Add a quarter

1. Add a source entry (id, url, title, date) to `sources` in `data/financials.json`.
2. Append an object to `quarters`. Amounts are USD millions. Cash-flow capex is negative. Use `firstReported` when the new release restates an older quarter, and point `source` at the release you actually read.
3. Run `npm run validate`. The 2025 revenue, adjusted EBITDA, and net income quarters are checked against the full-year totals of 529.8, -64.9, and 29.0.

## Add a guidance item

Append to `items` in `data/guidance.json`. A revision needs a date, a label, `low` and `high` (use null when the company did not give that side), `periodEnd`, a source id, a `change` (`initial`, `raised`, `cut`, `reaffirmed`, `timing`, or `replaced`), and a note in the company's terms. Put the actual, if one exists, on `actual`. Status is computed in `lib/guidance.ts`. It is not stored, so a hand edit cannot silently mark something "on track."

## Refresh the public feeds

```bash
npm run fetch:prices
npm run fetch:quote
npm run fetch:satellite
```

`fetch:quote` needs `FINNHUB_API_KEY` or `ALPHAVANTAGE_API_KEY`. `fetch:satellite` needs `gdalwarp` (`apt install gdal-bin`).

The price scripts append a snapshot only when the parsed rows changed. OpenRouter keeps a price history on every run. Quote fetching does not call Yahoo, Nasdaq, or Stooq. Stooq's robots.txt disallows general crawlers.

Satellite scenes are Copernicus Sentinel-2 L2A. Search hits the public Planetary Computer STAC API and the Copernicus Data Space STAC API. Pixel download from Copernicus Data Space needs an account. `CDSE_CLIENT_ID` and `CDSE_CLIENT_SECRET` are reserved in `.env.example` and are not used yet. Crops are rendered from Planetary Computer, which mirrors the same archive. Each image is labeled with the scene acquisition time. Resolution is 10 meters.

Token Factory's robots.txt allows only the public catalog API. The GPU fetcher requests the markdown form of the docs page. OpenRouter's robots.txt allows the API.

Vercel Cron is declared in `vercel.json` and handled by `app/api/cron/[job]`. On Vercel the disk is read-only, so that route does not write `data/`. The workflow `.github/workflows/refresh-public-data.yml` runs the fetchers daily and commits. Set `CRON_SECRET` if you want the cron route to require `Authorization: Bearer`.

Copy `.env.example` to `.env.local` for local keys. `.env.local` is gitignored.

## Deploy on Vercel and point nbismodel.com at it

The domain is already registered at an outside registrar. Vercel hosts the app.

1. Push this repository to the Git host Vercel should watch.
2. Import the repository in Vercel. Framework preset: Next.js. No environment variables are required for the first deploy. Add `CRON_SECRET` if you want cron authentication, and a quote key if the GitHub Action should commit closes.
3. Deploy. The production build is `npm run build`.
4. In the Vercel project, open Domains and add `nbismodel.com` and `www.nbismodel.com`. Vercel shows the DNS records to create.
5. At the registrar, add those records. Vercel currently asks for an `A` record on the apex and a `CNAME` from `www` to `cname.vercel-dns.com`. Use the values on the Vercel screen if they differ from any example you have seen elsewhere.
6. Wait until Vercel reports the domain as valid and the certificate is issued. Avoid a registrar proxy that blocks the HTTP challenge Vercel uses for the certificate.

The GitHub Action needs permission to push, and `FINNHUB_API_KEY` or `ALPHAVANTAGE_API_KEY` as a repository secret if closes should be committed.

## Models

The short-term band is a zero-drift lognormal range from realized or typed volatility. It does not use a stored price until the quote file has at least 20 closes.

The long-term model is version 2.3.0. Displayed value per share is floored at zero. Replacement capex declines 25% a year instead of repurchasing historical cost. Legacy megawatts start from recurring revenue divided by the disclosed 170 MW active census and converge toward contract rates. It is not a price target.

### Half-hour NBIS quote

The market-quote workflow reads Yahoo Finance with yahoo-finance2 during regular Nasdaq sessions and writes the last successful snapshot to `market-data/nbis.json` (branch `market-data`, file `nbis.json`). The site reads this public cache without a rebuild. The exchange calendar sets the session bounds, including shortened sessions. Scheduled Actions can run late. A closing run may collect the final regular-session quote in the half hour after the bell. Daily volatility uses completed daily bars. A failed refresh preserves the previous snapshot and its trade timestamp.
