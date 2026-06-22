# KPMD Programme Dashboard

A role based dashboard for the KPMD / MTLDK programme (investment INV 093207), built in Nuxt 3 and hosted on Netlify. It implements the design and reporting framework set out in the best practice note: one governed data source, deliverable traceability, two audience lenses, the five tier cadence framework, and a reporting engine that exports to Word, PowerPoint, PDF and Excel.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build

```bash
npm run generate   # static SPA output in .output/public
```

## Deploy to Netlify

This repository is ready to deploy with no extra configuration.

1. Push to a Git repository (GitHub, GitLab or Bitbucket).
2. In Netlify, choose "New site from Git" and select the repository.
3. Netlify reads `netlify.toml`:
   - Build command: `npm run generate`
   - Publish directory: `.output/public`
4. Deploy. The `_redirects` file routes all client side paths back to the app shell, so deep links such as `/reports` resolve on refresh.

## Sign in

The demonstration build uses a simple role selector on the login screen:

- **Programme staff** lands on the operational lens (daily view).
- **Donor and governance** lands on the accountability lens (quarterly view).
- **Administrator** sees every view.

In production this screen is replaced by Netlify Identity. The role is read from the identity Roles field, the same pattern used on the live programme sites. Only `composables/useAuth.js` changes; the rest of the app depends only on the resolved role.

## Architecture

| Area | File | Notes |
| --- | --- | --- |
| Data layer (single source of truth) | `data/seed.js` | Programme meta, 15 funded outputs, 5 offtakers, 10 counties, co-investment pipeline, MEAL, gender, stakeholders, impact. Swap for the live Google Sheets / database layer. |
| Data access | `composables/useProgrammeData.js` | Derived aggregates and formatters. |
| Auth and roles | `composables/useAuth.js` | Role state, role to navigation mapping. Replace with Netlify Identity. |
| Reporting engine | `composables/useReportExport.js` | Assembles one report model from three selectors (period, scope, audience), then renders to Word (docx), PowerPoint (pptxgenjs), PDF (jsPDF) or Excel (SheetJS). Libraries load on demand. |
| Cadence tiers | `pages/daily.vue` ... `pages/yearly.vue` | One page per tier of the framework. |
| Deliverables, offtakers, pipeline | `pages/deliverables.vue`, `pages/offtakers.vue`, `pages/pipeline.vue` | Traceability board, operational drill down, co-investment board. |
| Report builder | `pages/reports.vue` | Three selectors, live preview, standing catalogue, multi format export. |

## Connecting the live data layer

Replace the static exports in `data/seed.js` with calls to the governed source (for example Google Sheets via a service account, mirroring the existing programme sites). Keep the same shape and every view and export updates automatically, since they all read through `useProgrammeData.js`.

## Branding

Strathmore University Business School navy (`#1f3864`) and gold (`#a67c00`), Inter for the interface and Arial in the Word exports. Theme tokens live in `assets/css/main.css`.
