# JABA Rewind — School Reports

End-of-year athlete-marketing reports (2025–26) for 26 college programs, built with React + Vite.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static build → dist/
```

## URLs

- `/` — directory of every school report
- `/?school=baylor` — a single school's report (each is its own shareable link)

Available slugs: `baylor`, `arizona`, `unc`, `lsu`, `michigan-state`, `smu`, `clemson`,
`arkansas`, `texas`, `iowa`, `cincinnati`, `purdue`, `san-diego`, `robert-morris`,
`arizona-state`, `depaul`, `notre-dame`, `missouri`, `washington`, `georgia`,
`ohio-state`, `alabama`, `wisconsin`, `ucla`, `washington-state`, `nc-state`.

## Structure

- `src/report/EndOfYearReport.tsx` — the presentational report component (self-contained styles).
- `src/report/types.ts` — the `ReportData` contract.
- `src/report/schools/<slug>.ts` — one editable config per school (auto-discovered via `import.meta.glob`).
- `src/report/preview.tsx` — entry: directory at `/`, single report at `/?school=<slug>`.
- `public/` — local images (hero, brand product cards, the JABA bear, the Rewind title art).

Athlete headshots, post thumbnails, and school logos load from remote CDNs (Google Storage, ESPN).
