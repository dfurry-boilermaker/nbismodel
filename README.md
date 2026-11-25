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
npm run fetch:satellite
```

`fetch:satellite` needs `gdalwarp` (`apt install gdal-bin`). Share prices are typed by hand. There is no quote feed.

Price scripts retain one observation per UTC day, including unchanged prices. The chart starts with the first stored observation; it does not backfill unknown historical rates.

For public token volume, set the repository Actions secret `OPENROUTER_API_KEY` (an ordinary OpenRouter API key), then run the Refresh public data workflow. The usage fetcher collects the previous 90 days of daily public rankings, retaining up to 365 days locally. It stores no API key and makes no inference calls. Source: [OpenRouter rankings](https://openrouter.ai/rankings), CC BY 4.0. This is aggregate OpenRouter demand, not Nebius-specific traffic. Local refresh: `node scripts/fetch-openrouter-usage.mjs` with the key in the environment.

Satellite scenes are Copernicus Sentinel-2 L2A. Search hits the public Planetary Computer STAC API and the Copernicus Data Space STAC API. Pixel download from Copernicus Data Space needs an account. `CDSE_CLIENT_ID` and `CDSE_CLIENT_SECRET` are reserved in `.env.example` and are not used yet. Crops are rendered from Planetary Computer, which mirrors the same archive. Each image is labeled with the scene acquisition time. Resolution is 10 meters.

Token Factory's robots.txt allows only the public catalog API. The GPU fetcher requests the markdown form of the docs page. OpenRouter's robots.txt allows the API.

Vercel Cron is declared in `vercel.json` and handled by `app/api/cron/[job]`. On Vercel the disk is read-only, so that route does not write `data/`. The workflow `.github/workflows/refresh-public-data.yml` runs the fetchers daily and commits. Set `CRON_SECRET` if you want the cron route to require `Authorization: Bearer`.

Copy `.env.example` to `.env.local` for local keys. `.env.local` is gitignored.

## Deploy on Vercel and point nbismodel.com at it

The domain is already registered at an outside registrar. Vercel hosts the app.

1. Push this repository to the Git host Vercel should watch.
2. Import the repository in Vercel. Framework preset: Next.js. No environment variables are required for the first deploy. Add `CRON_SECRET` if you want cron authentication.
3. Deploy. The production build is `npm run build`.
4. In the Vercel project, open Domains and add `nbismodel.com` and `www.nbismodel.com`. Vercel shows the DNS records to create.
5. At the registrar, add those records. Vercel currently asks for an `A` record on the apex and a `CNAME` from `www` to `cname.vercel-dns.com`. Use the values on the Vercel screen if they differ from any example you have seen elsewhere.
6. Wait until Vercel reports the domain as valid and the certificate is issued. Avoid a registrar proxy that blocks the HTTP challenge Vercel uses for the certificate.

The GitHub Action needs permission to push.

## Models

The short-term band is a zero-drift lognormal range. The starting price is the hand-entered close of $87.31 as of 2026-11-24. Volatility is typed. This is not a directional forecast.

The long-term model is version 4.0.0. The headline is unlevered free cash flow on today's shares. Displayed value per share is floored at zero, and the raw figure is shown beside it. It is not a price target. The overview separately shows 12-month price scenarios with a FY2027 financing snapshot proxy, including modeled equity issuance through that date. Base and bull use forward DCF; the bear uses a judgmental 7x FY2028 adjusted EBITDA going-concern valuation. The original bear forward DCF remains visible as a severe distress stress test. See the methodology page for assumptions and limitations.

### Hand-entered close

The $87.31 figure is a closing price entered by hand as of 2026-11-24. It is not live and it is not fetched.
