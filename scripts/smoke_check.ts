import assert from "node:assert/strict";
import request from "supertest";

import app from "../src/app.js";

const routes = [
  "/",
  "/query-lane",
  "/cost-risks",
  "/optimization-posture",
  "/verification",
  "/docs",
  "/api/dashboard/summary",
  "/api/query-lane",
  "/api/cost-risks",
  "/api/optimization-posture",
  "/api/verification",
  "/api/sample"
] as const;

for (const route of routes) {
  const response = await request(app).get(route);
  assert.equal(response.status, 200, `${route} should return 200`);
}

console.log("smoke check passed");
