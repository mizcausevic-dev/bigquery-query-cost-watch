#!/usr/bin/env node

import fs from "node:fs";

import { analyze } from "./analyze.js";
import { toMarkdown, toSummary } from "./format.js";
import type { BigQueryCostExport } from "./types.js";

type Format = "json" | "markdown" | "summary";

function usage(): string {
  return [
    "Usage: bigquery-query-cost-watch <export.json> [options]",
    "",
    "Options:",
    "  --format <json|markdown|summary>       Output format (default: summary)",
    "  --now <iso>                             Override analysis time",
    "  --stale-optimization-after-hours <n>    Optimization SLA before stale flag (default: 24)",
    "  --fail-on-high                         Exit 1 if any high findings remain",
    "  --out <file>                           Write output to file"
  ].join("\n");
}

function parseArgs(argv: string[]) {
  const args = [...argv];
  const file = args.shift();
  if (!file) {
    throw new Error(usage());
  }

  let format: Format = "summary";
  let now: string | undefined;
  let staleOptimizationAfterHours: number | undefined;
  let failOnHigh = false;
  let out: string | undefined;

  while (args.length > 0) {
    const flag = args.shift();
    switch (flag) {
      case "--format":
        format = (args.shift() as Format | undefined) ?? "summary";
        break;
      case "--now":
        now = args.shift();
        break;
      case "--stale-optimization-after-hours":
        staleOptimizationAfterHours = Number(args.shift());
        break;
      case "--fail-on-high":
        failOnHigh = true;
        break;
      case "--out":
        out = args.shift();
        break;
      default:
        throw new Error(`Unknown flag: ${flag}\n\n${usage()}`);
    }
  }

  return { file, format, now, staleOptimizationAfterHours, failOnHigh, out };
}

function render(format: Format, payload: ReturnType<typeof analyze>): string {
  switch (format) {
    case "json":
      return JSON.stringify(payload, null, 2);
    case "markdown":
      return toMarkdown(payload);
    case "summary":
    default:
      return toSummary(payload);
  }
}

async function main() {
  const { file, format, now, staleOptimizationAfterHours, failOnHigh, out } = parseArgs(process.argv.slice(2));
  const input = JSON.parse(fs.readFileSync(file, "utf8")) as BigQueryCostExport;
  const report = analyze(input, { now, staleOptimizationAfterHours });
  const output = render(format, report);

  if (out) {
    fs.writeFileSync(out, output, "utf8");
  } else {
    process.stdout.write(`${output}\n`);
  }

  if (failOnHigh && report.findingsList.some((finding) => finding.severity === "high")) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
