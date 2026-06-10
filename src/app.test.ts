import request from "supertest";
import { describe, expect, test } from "vitest";

import app from "./app.js";

describe("app", () => {
  test("serves overview and docs", async () => {
    const overview = await request(app).get("/");
    expect(overview.status).toBe(200);
    expect(overview.text).toContain("BigQuery query-cost posture");
    expect(overview.text).toContain("Product depth");

    const docs = await request(app).get("/docs");
    expect(docs.status).toBe(200);
    expect(docs.text).toContain("Offline BigQuery cost analysis");
  });

  test("serves secondary HTML routes", async () => {
    const routes = [
      ["/query-lane", "Query Lane"],
      ["/cost-risks", "Cost Risks"],
      ["/optimization-posture", "Optimization Posture"],
      ["/verification", "Verification"]
    ] as const;

    for (const [route, marker] of routes) {
      const response = await request(app).get(route);
      expect(response.status).toBe(200);
      expect(response.text).toContain(marker);
    }
  });

  test("serves summary and sample apis", async () => {
    const response = await request(app).get("/api/dashboard/summary");
    expect(response.status).toBe(200);
    expect(response.body.snapshots).toBe(2);

    const sample = await request(app).get("/api/sample");
    expect(sample.status).toBe(200);
    expect(sample.body.sample.snapshots).toHaveLength(2);
  });

  test("serves operator API routes", async () => {
    const queryLaneResponse = await request(app).get("/api/query-lane");
    expect(queryLaneResponse.status).toBe(200);
    expect(queryLaneResponse.body[0]).toHaveProperty("lane");

    const costRisksResponse = await request(app).get("/api/cost-risks");
    expect(costRisksResponse.status).toBe(200);
    expect(costRisksResponse.body[0]).toHaveProperty("code");
    expect(costRisksResponse.body[0]).toHaveProperty("owner");

    const postureResponse = await request(app).get("/api/optimization-posture");
    expect(postureResponse.status).toBe(200);
    expect(postureResponse.body[0]).toHaveProperty("packetId");

    const verificationResponse = await request(app).get("/api/verification");
    expect(verificationResponse.status).toBe(200);
    expect(verificationResponse.body[0]).toContain("offline");
  });
});
