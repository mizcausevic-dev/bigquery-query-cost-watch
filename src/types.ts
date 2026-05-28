// Operator surface for BigQuery query-cost governance and workload optimization posture.

export type ScopeKind = "ORG" | "PROJECT" | "RESERVATION" | "WORKLOAD";
export type BaselineStatus = "CURRENT" | "STALE";
export type DriftStatus = "OPEN" | "ACKNOWLEDGED" | "ROUTED";
export type AnomalyFamily = "Queries" | "Slots" | "Storage" | "Attribution" | "Telemetry" | "Pipelines";

export interface WorkloadSnapshot {
  id: string;
  name: string;
  scope: ScopeKind;
  scopePath: string;
  billingProject: string;
  baselineStatus: BaselineStatus;
  owner: string;
  currentMonthUsd: number;
  budgetUsd: number;
  monthOverMonthChangePct: number;
  labeledSpendPct: number;
  slotUtilizationPct: number;
  collectedAt: string;
}

export interface QueryCostDrift {
  id: string;
  snapshotId: string;
  scope: ScopeKind;
  scopePath: string;
  family: AnomalyFamily;
  status: DriftStatus;
  resourceName: string;
  expectedState: string;
  observedState: string;
  estimatedImpactUsd: number;
  changeWindowHours: number;
  owner: string;
  breaksGuardrail?: boolean;
  affectsForecast?: boolean;
  affectsChargeback?: boolean;
  note?: string;
}

export interface BigQueryCostExport {
  snapshots?: WorkloadSnapshot[];
  drifts?: QueryCostDrift[];
}

export type FindingSeverity = "high" | "medium" | "low" | "info";

export type FindingCode =
  | "no-current-snapshot"
  | "stale-snapshot"
  | "bytes-scanned-spike"
  | "slot-pressure-surge"
  | "partition-filter-miss"
  | "reservation-drift"
  | "low-attribution-coverage"
  | "storage-retention-bloat"
  | "telemetry-gap"
  | "stale-optimization-window";

export interface Finding {
  code: FindingCode;
  severity: FindingSeverity;
  message: string;
  subject: string;
  subjectName?: string;
  scope?: ScopeKind;
  family?: AnomalyFamily;
  resourceName?: string;
}

export interface DriftReport {
  generatedAt: string;
  snapshots: number;
  currentSnapshots: number;
  drifts: number;
  querySpikes: number;
  attributionGaps: number;
  optimizationEscalations: number;
  findingsList: Finding[];
  ok: boolean;
}

export interface DriftOptions {
  now?: string;
  staleOptimizationAfterHours?: number;
}
