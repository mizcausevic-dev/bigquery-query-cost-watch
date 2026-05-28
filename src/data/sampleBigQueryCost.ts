import type { BigQueryCostExport } from "../types.js";

export const sampleBigQueryCostPayload: BigQueryCostExport = {
  snapshots: [
    {
      id: "snap-shared-analytics",
      name: "Shared analytics and reporting",
      scope: "ORG",
      scopePath: "/orgs/kg-prod/projects/shared-analytics",
      billingProject: "kg-shared-analytics",
      baselineStatus: "CURRENT",
      owner: "Data Platform",
      currentMonthUsd: 6940,
      budgetUsd: 6200,
      monthOverMonthChangePct: 16,
      labeledSpendPct: 87,
      slotUtilizationPct: 82,
      collectedAt: "2026-05-30T14:00:00Z"
    },
    {
      id: "snap-finance-pipelines",
      name: "Finance mart and export feeds",
      scope: "PROJECT",
      scopePath: "/orgs/kg-prod/projects/finance-reporting",
      billingProject: "kg-finance-reporting",
      baselineStatus: "STALE",
      owner: "FinOps Operations",
      currentMonthUsd: 2190,
      budgetUsd: 2400,
      monthOverMonthChangePct: 6,
      labeledSpendPct: 73,
      slotUtilizationPct: 61,
      collectedAt: "2026-05-27T08:30:00Z"
    }
  ],
  drifts: [
    {
      id: "drift-scan-spike",
      snapshotId: "snap-shared-analytics",
      scope: "WORKLOAD",
      scopePath: "/orgs/kg-prod/projects/shared-analytics/queries/weekly_exec_rollup",
      family: "Queries",
      status: "OPEN",
      resourceName: "weekly_exec_rollup.sql",
      expectedState: "Executive rollup query stays partition-aware and scan-efficient.",
      observedState: "Bytes scanned spike after wide scan and repeated history reads.",
      estimatedImpactUsd: 1180,
      changeWindowHours: 16,
      owner: "Analytics Engineering",
      breaksGuardrail: true,
      affectsForecast: true
    },
    {
      id: "drift-partition-miss",
      snapshotId: "snap-shared-analytics",
      scope: "WORKLOAD",
      scopePath: "/orgs/kg-prod/projects/shared-analytics/queries/customer_ltv_refresh",
      family: "Queries",
      status: "ACKNOWLEDGED",
      resourceName: "customer_ltv_refresh.sql",
      expectedState: "Workload uses partition filters and bounded date windows.",
      observedState: "Full scan without partition filter after template regression.",
      estimatedImpactUsd: 410,
      changeWindowHours: 29,
      owner: "Analytics Engineering"
    },
    {
      id: "drift-slot-pressure",
      snapshotId: "snap-shared-analytics",
      scope: "RESERVATION",
      scopePath: "/orgs/kg-prod/reservations/analytics-prod",
      family: "Slots",
      status: "OPEN",
      resourceName: "analytics-prod",
      expectedState: "Reservation queue stays within the published latency envelope.",
      observedState: "Slot queue pressure and reservation contention are rising during refresh peaks.",
      estimatedImpactUsd: 760,
      changeWindowHours: 18,
      owner: "Data Platform",
      breaksGuardrail: true,
      affectsForecast: true
    },
    {
      id: "drift-reservation-underuse",
      snapshotId: "snap-finance-pipelines",
      scope: "RESERVATION",
      scopePath: "/orgs/kg-prod/reservations/finance-backoffice",
      family: "Slots",
      status: "ACKNOWLEDGED",
      resourceName: "finance-backoffice",
      expectedState: "Reservation stays right-sized for scheduled finance workloads.",
      observedState: "Reservation underused outside a short daily batch window.",
      estimatedImpactUsd: 290,
      changeWindowHours: 34,
      owner: "FinOps Operations"
    },
    {
      id: "drift-attribution-gap",
      snapshotId: "snap-finance-pipelines",
      scope: "PROJECT",
      scopePath: "/orgs/kg-prod/projects/finance-reporting",
      family: "Attribution",
      status: "OPEN",
      resourceName: "kg-finance-reporting",
      expectedState: "Scheduled queries and data-transfer spend carry owner and cost-center labels.",
      observedState: "Unlabeled BigQuery spend remains on two scheduled query paths.",
      estimatedImpactUsd: 220,
      changeWindowHours: 41,
      owner: "FinOps Operations",
      affectsChargeback: true
    },
    {
      id: "drift-telemetry-gap",
      snapshotId: "snap-finance-pipelines",
      scope: "PROJECT",
      scopePath: "/orgs/kg-prod/projects/finance-reporting/exports/billing_feed",
      family: "Telemetry",
      status: "OPEN",
      resourceName: "billing_export_feed",
      expectedState: "Billing export and INFORMATION_SCHEMA usage extracts land daily for optimization review.",
      observedState: "Usage export partitions are missing for the last two days.",
      estimatedImpactUsd: 180,
      changeWindowHours: 36,
      owner: "Data Platform",
      breaksGuardrail: true,
      affectsChargeback: true
    }
  ]
};

export const queryLanePackets = [
  {
    id: "scan-efficiency",
    lane: "Scan efficiency lane",
    owner: "Analytics Engineering",
    focus: "Bytes scanned, partition discipline, and wide-read regression control",
    status: "red",
    note: "High-value workloads are scanning more data than the budget envelope expects.",
    nextAction: "Restore partition filters and tune the hotspot queries before the next executive refresh cycle."
  },
  {
    id: "slot-governance",
    lane: "Slot governance lane",
    owner: "Data Platform",
    focus: "Reservation pressure, queue health, and right-sizing posture",
    status: "red",
    note: "Reservation contention and underuse are both weakening slot efficiency.",
    nextAction: "Rebalance reservations and reduce queue pressure on the busiest analytics paths."
  },
  {
    id: "attribution-hygiene",
    lane: "Attribution hygiene lane",
    owner: "FinOps Operations",
    focus: "Labels, chargeback trust, and finance-facing visibility",
    status: "yellow",
    note: "Unlabeled query-cost paths are reducing showback trust.",
    nextAction: "Backfill labels and enforce owner tagging on scheduled query workflows."
  },
  {
    id: "telemetry-freshness",
    lane: "Telemetry freshness lane",
    owner: "Data Platform",
    focus: "Billing exports, usage extracts, and optimization evidence freshness",
    status: "yellow",
    note: "Telemetry and export freshness need cleanup before query-cost posture can be called healthy.",
    nextAction: "Restore export freshness and validate downstream cost-governance feeds."
  }
] as const;

export const optimizationPackets = [
  {
    packetId: "BQ-11",
    lane: "Scan-efficiency recovery",
    owner: "Analytics Engineering",
    status: "red",
    completenessScore: 56,
    decisionNote: "Query scans and partition misses are both active, so workload efficiency is not ready for sign-off.",
    blocker: "Partition filter fixes and query rewrites still need to land on the highest-cost workloads.",
    launchWindowHours: 10
  },
  {
    packetId: "BQ-19",
    lane: "Slot-governance repair",
    owner: "Data Platform",
    status: "red",
    completenessScore: 63,
    decisionNote: "Reservation pressure is still too high during peak analytics windows.",
    blocker: "Reservation rebalance and queue-mitigation work have not completed.",
    launchWindowHours: 14
  },
  {
    packetId: "BQ-24",
    lane: "Attribution cleanup",
    owner: "FinOps Operations",
    status: "yellow",
    completenessScore: 75,
    decisionNote: "Label hygiene can clear once the remaining unowned scheduled-query paths are mapped.",
    blocker: "Two cost-center mappings are still missing from the finance reporting project.",
    launchWindowHours: 18
  },
  {
    packetId: "BQ-31",
    lane: "Telemetry restoration",
    owner: "Data Platform",
    status: "yellow",
    completenessScore: 71,
    decisionNote: "Telemetry freshness is recoverable in one optimization cycle.",
    blocker: "Usage export partitions must replay before the next cost review window.",
    launchWindowHours: 24
  }
] as const;
