import { describe, expect, test } from "vitest";

import {
  renderCostRisks,
  renderDocs,
  renderOptimizationPosture,
  renderOverview,
  renderQueryLane,
  renderVerification,
  renderSample
} from "./render.js";

describe("render", () => {
  test("overview carries the BigQuery cost framing", () => {
    expect(renderOverview()).toContain("BigQuery query-cost posture");
    expect(renderOverview()).toContain("BigQuery / FinOps / query-cost proof");
  });

  test("lane and posture routes render expected headings", () => {
    expect(renderQueryLane()).toContain("Query Lane");
    expect(renderCostRisks()).toContain("Cost Risks");
    expect(renderOptimizationPosture()).toContain("Optimization Posture");
  });

  test("docs and verification remain operator-safe", () => {
    expect(renderDocs()).toContain("Offline BigQuery cost analysis");
    expect(renderVerification()).toContain("synthetic data");
    expect(renderSample()).toContain("\"summary\"");
  });
});
