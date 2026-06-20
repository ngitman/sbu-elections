# Stony Brook USG Election Results

A standalone single-page app that visualizes Stony Brook University USG
election results by year. Built with **Vite** + **React** + **MUI**.

This is intentionally its own project/domain so it is indexed by search
engines independently of any personal site.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build    # outputs to ./dist
npm run preview  # serve the production build locally
```

## Data

Election data lives in `public/electiondata/<year>.json`. To add a year,
drop in a new JSON file and add the year to `dataAvailability` in
`src/ElectionResults.jsx`.

## Routes

- `/` — most recent year
- `/:year` — a specific year (e.g. `/2024`)

## Deploy (Netlify)

Deployed at **https://sbu-elections.netlify.app/** via Netlify (auto-builds on
push to `main`). Build command `npm run build`, publish directory `dist`, and the
SPA routing fallback are all configured in `netlify.toml`.

The production URL is referenced in `index.html` (canonical + og:url),
`public/sitemap.xml`, and `public/robots.txt`. Update those if the domain changes.

(Optional, recommended) In Google Search Console, add the site and submit
`/sitemap.xml`.
