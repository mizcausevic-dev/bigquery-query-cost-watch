// SPDX-License-Identifier: AGPL-3.0-or-later

import { analyze } from "../analyze.js";
import { optimizationPackets, queryLanePackets, sampleBigQueryCostPayload } from "../data/sampleBigQueryCost.js";
import type { Finding } from "../types.js";

const NOW = "2026-05-30T00:00:00Z";
const report = analyze(sampleBigQueryCostPayload, {
  now: NOW,
  staleOptimizationAfterHours: 24
});

function severityRank(finding: Finding): number {
  return finding.severity === "high" ? 0 : finding.severity === "medium" ? 1 : finding.severity === "low" ? 2 : 3;
}

export function summary() {
  return {
    snapshots: report.snapshots,
    currentSnapshots: report.currentSnapshots,
    drifts: report.drifts,
    querySpikes: report.querySpikes,
    attributionGaps: report.attributionGaps,
    optimizationEscalations: report.optimizationEscalations,
    highFindings: report.findingsList.filter((finding) => finding.severity === "high").length,
    recommendation:
      "Contain the bytes-scanned spike, tune the partition misses, rebalance reservations, restore telemetry, and backfill labels before calling BigQuery query-cost posture healthy."
  };
}

export function queryLane() {
  return queryLanePackets.map((lane) => ({
    ...lane,
    relatedFindings: report.findingsList.filter((finding) => {
      if (lane.id === "scan-efficiency") {
        return finding.code === "bytes-scanned-spike" || finding.code === "partition-filter-miss";
      }
      if (lane.id === "slot-governance") {
        return finding.code === "slot-pressure-surge" || finding.code === "reservation-drift";
      }
      if (lane.id === "attribution-hygiene") {
        return finding.code === "low-attribution-coverage";
      }
      if (lane.id === "telemetry-freshness") {
        return finding.code === "telemetry-gap" || finding.code === "stale-snapshot" || finding.code === "stale-optimization-window";
      }
      return false;
    }).length
  }));
}

export function costRisks() {
  return [...report.findingsList]
    .sort((left, right) => severityRank(left) - severityRank(right))
    .map((finding) => ({
      ...finding,
      owner:
        finding.code === "bytes-scanned-spike" || finding.code === "partition-filter-miss"
          ? "Analytics Engineering"
          : finding.code === "slot-pressure-surge" || finding.code === "reservation-drift"
            ? "Data Platform"
            : finding.code === "low-attribution-coverage"
              ? "FinOps Operations"
              : "Data Platform"
    }));
}

export function optimizationPosture() {
  return optimizationPackets;
}

export function verification() {
  return [
    "The dashboard is backed by a real offline analyzer and CLI, not static copy alone.",
    "Workload snapshots and query-cost packets are synthetic sample data only; no live BigQuery credentials, SQL text, or project secrets are published.",
    "The control plane keeps query, slot, attribution, storage, and telemetry drift visible for FinOps and analytics stakeholders.",
    "This surface demonstrates BigQuery query-cost governance operations, not a generic cloud-cost keyword page.",
    "It complements Azure, Entra, AWS, GCP IAM, and reporting proof with a concrete BigQuery optimization lane."
  ];
}

export function payload() {
  return {
    summary: summary(),
    queryLane: queryLane(),
    costRisks: costRisks(),
    optimizationPosture: optimizationPosture(),
    verification: verification(),
    sample: sampleBigQueryCostPayload
  };
}
