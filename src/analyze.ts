import type { BigQueryCostExport, DriftOptions, DriftReport, Finding, WorkloadSnapshot } from "./types.js";

function isCurrent(snapshot: WorkloadSnapshot): boolean {
  return snapshot.baselineStatus === "CURRENT";
}

export function analyze(payload: BigQueryCostExport, options: DriftOptions = {}): DriftReport {
  const now = options.now ?? new Date().toISOString();
  const staleOptimizationAfterHours = options.staleOptimizationAfterHours ?? 24;
  const snapshots = payload.snapshots ?? [];
  const drifts = payload.drifts ?? [];
  const findingsList: Finding[] = [];

  const currentSnapshots = snapshots.filter(isCurrent).length;
  if (currentSnapshots === 0) {
    findingsList.push({
      code: "no-current-snapshot",
      severity: "high",
      message: "No current BigQuery workload snapshot is available for query-cost governance decisions.",
      subject: "snapshot-currentness"
    });
  }

  for (const snapshot of snapshots) {
    if (snapshot.baselineStatus === "STALE") {
      findingsList.push({
        code: "stale-snapshot",
        severity: "medium",
        message: `Workload snapshot for "${snapshot.name}" is stale and should be refreshed before certifying query-cost posture.`,
        subject: snapshot.id,
        subjectName: snapshot.scopePath,
        scope: snapshot.scope
      });
    }
  }

  for (const drift of drifts) {
    const observed = drift.observedState.toLowerCase();
    const expected = drift.expectedState.toLowerCase();

    if (drift.family === "Queries" && (observed.includes("bytes scanned") || observed.includes("scan spike") || drift.estimatedImpactUsd >= 900)) {
      findingsList.push({
        code: "bytes-scanned-spike",
        severity: "high",
        message: `Bytes-scanned spike on "${drift.scopePath}" is already pressuring the monthly BigQuery runway by $${Math.round(drift.estimatedImpactUsd).toLocaleString()}.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.family === "Slots" && (observed.includes("slot") || observed.includes("queue") || drift.estimatedImpactUsd >= 600)) {
      findingsList.push({
        code: "slot-pressure-surge",
        severity: drift.breaksGuardrail ? "high" : "medium",
        message: `Slot pressure is active on "${drift.resourceName}" within "${drift.scopePath}" and should be relieved before queue times keep compounding.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.family === "Queries" && (observed.includes("partition") || observed.includes("full scan") || expected.includes("partition filter"))) {
      findingsList.push({
        code: "partition-filter-miss",
        severity: "medium",
        message: `Partition-filter discipline is missing on "${drift.resourceName}" and scan efficiency is slipping.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.family === "Slots" && (observed.includes("reservation") || observed.includes("idle slot") || observed.includes("underused"))) {
      findingsList.push({
        code: "reservation-drift",
        severity: "medium",
        message: `Reservation posture on "${drift.scopePath}" is drifting and slot allocation should be rebalanced.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.family === "Attribution" && (observed.includes("missing") || observed.includes("unlabeled") || drift.affectsChargeback)) {
      findingsList.push({
        code: "low-attribution-coverage",
        severity: "medium",
        message: `Attribution coverage is drifting on "${drift.scopePath}" and unlabeled BigQuery spend is reducing showback trust.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.family === "Storage" && (observed.includes("retention") || observed.includes("long-term storage") || drift.estimatedImpactUsd >= 300)) {
      findingsList.push({
        code: "storage-retention-bloat",
        severity: drift.breaksGuardrail ? "high" : "medium",
        message: `Storage-retention bloat is active on "${drift.scopePath}" and should be reduced before storage spend keeps climbing.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.family === "Telemetry" && (observed.includes("missing") || expected.includes("billing export") || expected.includes("usage export"))) {
      findingsList.push({
        code: "telemetry-gap",
        severity: "high",
        message: `Telemetry coverage is broken on "${drift.scopePath}", which weakens downstream query-cost governance and optimization trust.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.changeWindowHours > staleOptimizationAfterHours) {
      findingsList.push({
        code: "stale-optimization-window",
        severity: drift.changeWindowHours > staleOptimizationAfterHours * 2 ? "medium" : "low",
        message: `Drift on "${drift.scopePath}" has remained unresolved for ${drift.changeWindowHours} hours.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }
  }

  const querySpikes = drifts.filter((drift) => drift.family === "Queries").length;
  const attributionGaps = drifts.filter((drift) => drift.family === "Attribution").length;
  const optimizationEscalations = drifts.filter((drift) => drift.breaksGuardrail || drift.status !== "ROUTED").length;
  const ok = !findingsList.some((finding) => finding.severity === "high");

  return {
    generatedAt: now,
    snapshots: snapshots.length,
    currentSnapshots,
    drifts: drifts.length,
    querySpikes,
    attributionGaps,
    optimizationEscalations,
    findingsList,
    ok
  };
}
