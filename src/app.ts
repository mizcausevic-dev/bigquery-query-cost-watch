// SPDX-License-Identifier: AGPL-3.0-or-later

import express from "express";
import { fileURLToPath } from "node:url";

import {
  costRisks,
  optimizationPosture,
  payload,
  queryLane,
  summary,
  verification
} from "./services/bigQueryCostWatchService.js";
import {
  renderCostRisks,
  renderDocs,
  renderOptimizationPosture,
  renderOverview,
  renderQueryLane,
  renderVerification
} from "./services/render.js";

const app = express();
const port = Number(process.env.PORT ?? 5524);
const host = process.env.HOST || "0.0.0.0";

app.get("/", (_req, res) => res.type("html").send(renderOverview()));
app.get("/query-lane", (_req, res) => res.type("html").send(renderQueryLane()));
app.get("/cost-risks", (_req, res) => res.type("html").send(renderCostRisks()));
app.get("/optimization-posture", (_req, res) => res.type("html").send(renderOptimizationPosture()));
app.get("/verification", (_req, res) => res.type("html").send(renderVerification()));
app.get("/docs", (_req, res) => res.type("html").send(renderDocs()));

app.get("/api/dashboard/summary", (_req, res) => res.json(summary()));
app.get("/api/query-lane", (_req, res) => res.json(queryLane()));
app.get("/api/cost-risks", (_req, res) => res.json(costRisks()));
app.get("/api/optimization-posture", (_req, res) => res.json(optimizationPosture()));
app.get("/api/verification", (_req, res) => res.json(verification()));
app.get("/api/sample", (_req, res) => res.json(payload()));

const currentFile = fileURLToPath(import.meta.url);
const invokedDirectly = process.argv[1] !== undefined && currentFile === process.argv[1];

if (invokedDirectly) {
  app.listen(port, host, () => {
    console.log(`BigQuery Query Cost Watch listening on http://${host}:${port}`);
  });
}

export default app;
