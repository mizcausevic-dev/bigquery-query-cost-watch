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
    const overview = renderOverview();
    expect(overview).toContain("BigQuery query-cost posture");
    expect(overview).toContain("BigQuery / FinOps / query-cost proof");
    expect(overview).toContain("Product depth");
    expect(overview).toContain("What these repos have in common");
    expect(overview).toContain("Portfolio atlas");
    expect(overview).toContain("buyer value");
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
