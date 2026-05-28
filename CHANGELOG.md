# Changelog

## v1.0.0-prod — 2026-05-27
- Production hardening pass: confirmed CI (lint, typecheck, coverage, build, demo, smoke, prerender, npm audit on Node 20/22) and Pages workflow are green on `main` at HEAD before tagging `v1.0-prod`.
- v0.1 already arrived with LICENSE (AGPL-3.0-or-later), `CODE_OF_CONDUCT.md`, `SECURITY.md`, `.github/dependabot.yml` (npm + github-actions, weekly), and dual-Node 20/22 CI — Wave 14 baseline at hardening parity with the rest of the data-platform lane.
- No `src/`, README narrative, docs, or screenshot edits — squad doctrine v1.1 respects the v0.1-shipped operator-surface as Codex shipped it.

## v0.1-shipped

- Initial release: operator surface for BigQuery query-cost governance and workload optimization posture.
- Added a public dashboard surface with overview, query-lane, cost-risks, optimization-posture, verification, and docs routes.
- Added prerendered GitHub Pages packaging for `bigquery.kineticgain.com` with `CNAME`, `robots.txt`, `sitemap.xml`, and OG/meta injection at deploy time.
- Added an offline analyzer and CLI for bytes-scanned spikes, partition misses, slot pressure, attribution drift, telemetry gaps, and stale optimization windows.
