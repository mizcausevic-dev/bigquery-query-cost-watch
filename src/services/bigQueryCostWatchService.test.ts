import { describe, expect, test } from "vitest";

import {
  costRisks,
  optimizationPosture,
  queryLane,
  summary,
  verification,
} from "./bigQueryCostWatchService.js";

describe("bigQueryCostWatchService", () => {
  test("summary reflects the sample BigQuery posture", () => {
    expect(summary()).toMatchObject({
      snapshots: 2,
      currentSnapshots: 1,
      drifts: 6,
      querySpikes: 2,
      attributionGaps: 1,
      optimizationEscalations: 6
    });
  });

  test("query lane maps related findings", () => {
    const lanes = queryLane();
    expect(lanes).toHaveLength(4);
    expect(lanes.find((lane) => lane.id === "scan-efficiency")?.relatedFindings).toBeGreaterThan(0);
  });

  test("cost risks expose hotspot and telemetry findings", () => {
    const findings = costRisks();
    expect(findings.find((finding) => finding.code === "bytes-scanned-spike")).toBeDefined();
    expect(findings.find((finding) => finding.code === "telemetry-gap")).toBeDefined();
  });

  test("optimization posture and verification stay populated", () => {
    expect(optimizationPosture()).toHaveLength(4);
    expect(verification()).toHaveLength(5);
  });
});
