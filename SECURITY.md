# Security Policy

`bigquery-query-cost-watch` ships both an offline analyzer and a synthetic public dashboard surface. It reads JSON exports from BigQuery usage and optimization snapshots (or synthetic data) and emits structured findings, route JSON, and prerendered HTML. No live cloud credential storage, no remote fetch of production billing data, and no execution of user-supplied code is included.

## Reporting

- [Open a security advisory](https://github.com/mizcausevic-dev/bigquery-query-cost-watch/security/advisories/new)

## Scope notes

- The public dashboard is a static proof surface, not a live bridge into a production BigQuery environment.
- Keep uploaded or tested data synthetic unless you have explicit approval to process a real export offline.
