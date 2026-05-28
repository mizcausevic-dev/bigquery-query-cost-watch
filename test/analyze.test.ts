import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { analyze } from "../src/analyze.js";
import { toMarkdown, toSummary } from "../src/format.js";
import type { BigQueryCostExport } from "../src/types.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const fixture = (name: string): BigQueryCostExport =>
  JSON.parse(readFileSync(`${here}/../fixtures/${name}`, "utf8")) as BigQueryCostExport;

const NOW = "2026-05-30T00:00:00Z";

describe("analyze", () => {
  it("counts snapshots and drifts", () => {
    const report = analyze(fixture("bigquery-query-hotspots.json"), { now: NOW });
    expect(report.snapshots).toBe(2);
    expect(report.currentSnapshots).toBe(1);
    expect(report.drifts).toBe(6);
  });

  it("flags missing current snapshot as high", () => {
    const report = analyze({ snapshots: [], drifts: [] }, { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "no-current-snapshot")?.severity).toBe("high");
  });

  it("flags stale snapshots and query spikes", () => {
    const report = analyze(fixture("bigquery-query-hotspots.json"), { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "stale-snapshot")?.subjectName).toContain("/projects/");
    expect(report.findingsList.find((finding) => finding.code === "bytes-scanned-spike")).toBeDefined();
  });

  it("flags query, attribution, slot, and telemetry drift", () => {
    const report = analyze(fixture("bigquery-query-hotspots.json"), { now: NOW, staleOptimizationAfterHours: 24 });
    expect(report.findingsList.find((finding) => finding.code === "bytes-scanned-spike")?.resourceName).toBe("weekly_exec_rollup.sql");
    expect(report.findingsList.find((finding) => finding.code === "low-attribution-coverage")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "slot-pressure-surge")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "telemetry-gap")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "stale-optimization-window")).toBeDefined();
  });

  it("flags partition misses and reservation drift", () => {
    const report = analyze(
      {
        snapshots: [
          {
            id: "snap-project",
            name: "Project baseline",
            scope: "PROJECT",
            scopePath: "/orgs/kg-prod/projects/shared-analytics",
            billingProject: "kg-shared-analytics",
            baselineStatus: "CURRENT",
            owner: "Data Platform",
            currentMonthUsd: 2000,
            budgetUsd: 2200,
            monthOverMonthChangePct: 3,
            labeledSpendPct: 98,
            slotUtilizationPct: 54,
            collectedAt: NOW
          }
        ],
        drifts: [
          {
            id: "drift-partition-miss",
            snapshotId: "snap-project",
            scope: "WORKLOAD",
            scopePath: "/orgs/kg-prod/projects/shared-analytics/queries/customer_ltv_refresh",
            family: "Queries",
            status: "OPEN",
            resourceName: "customer_ltv_refresh.sql",
            expectedState: "Workload uses partition filters and bounded date windows.",
            observedState: "Full scan without partition filter after template regression.",
            estimatedImpactUsd: 360,
            changeWindowHours: 12,
            owner: "Data Platform",
            breaksGuardrail: true
          },
          {
            id: "drift-reservation-underuse",
            snapshotId: "snap-project",
            scope: "RESERVATION",
            scopePath: "/orgs/kg-prod/reservations/analytics-prod",
            family: "Slots",
            status: "ACKNOWLEDGED",
            resourceName: "analytics-prod",
            expectedState: "Reservation stays right-sized for peak workloads.",
            observedState: "Reservation underused outside a short batch window.",
            estimatedImpactUsd: 190,
            changeWindowHours: 14,
            owner: "Data Platform"
          }
        ]
      },
      { now: NOW }
    );

    expect(report.findingsList.find((finding) => finding.code === "partition-filter-miss")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "reservation-drift")).toBeDefined();
  });

  it("ok=true on a clean fixture", () => {
    const report = analyze(fixture("bigquery-query-healthy.json"), { now: NOW });
    expect(report.ok).toBe(true);
    expect(report.findingsList.filter((finding) => finding.severity === "high")).toEqual([]);
  });
});

describe("formatters", () => {
  it("toMarkdown ranks high findings first", () => {
    const markdown = toMarkdown(analyze(fixture("bigquery-query-hotspots.json"), { now: NOW }));
    expect(markdown).toContain("❌");
    expect(markdown.indexOf("🔴")).toBeLessThan(markdown.indexOf("🟠"));
  });

  it("toMarkdown handles a clean payload with no findings", () => {
    const markdown = toMarkdown(analyze(fixture("bigquery-query-healthy.json"), { now: NOW }));
    expect(markdown).toContain("No findings.");
  });

  it("toSummary emits a one-liner", () => {
    const summary = toSummary(analyze(fixture("bigquery-query-hotspots.json"), { now: NOW }));
    expect(summary).toMatch(/snapshots/);
    expect(summary).toMatch(/drifts/);
  });
});
