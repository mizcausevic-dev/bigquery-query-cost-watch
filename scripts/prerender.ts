import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  costRisks,
  optimizationPosture,
  payload,
  queryLane,
  summary,
  verification
} from "../src/services/bigQueryCostWatchService.js";
import {
  renderCostRisks,
  renderDocs,
  renderOptimizationPosture,
  renderOverview,
  renderQueryLane,
  renderVerification,
  renderSample
} from "../src/services/render.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "site");
const domain = fs.readFileSync(path.join(root, "CNAME"), "utf8").trim();

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(path.join(outputDir, "api", "dashboard"), { recursive: true });
fs.copyFileSync(path.join(root, "CNAME"), path.join(outputDir, "CNAME"));

const pages: Record<string, string> = {
  "index.html": renderOverview(),
  [path.join("query-lane", "index.html")]: renderQueryLane(),
  [path.join("cost-risks", "index.html")]: renderCostRisks(),
  [path.join("optimization-posture", "index.html")]: renderOptimizationPosture(),
  [path.join("verification", "index.html")]: renderVerification(),
  [path.join("docs", "index.html")]: renderDocs(),
  [path.join("sample", "index.html")]: renderSample()
};

for (const [relativePath, html] of Object.entries(pages)) {
  const fullPath = path.join(outputDir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, html, "utf8");
}

const apiPayloads: Record<string, unknown> = {
  [path.join("api", "dashboard", "summary.json")]: summary(),
  [path.join("api", "query-lane.json")]: queryLane(),
  [path.join("api", "cost-risks.json")]: costRisks(),
  [path.join("api", "optimization-posture.json")]: optimizationPosture(),
  [path.join("api", "verification.json")]: verification(),
  [path.join("api", "sample.json")]: payload()
};

for (const [relativePath, data] of Object.entries(apiPayloads)) {
  const fullPath = path.join(outputDir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf8");
}

const today = new Date().toISOString().slice(0, 10);
const htmlPaths = Object.keys(pages)
  .filter((relativePath) => relativePath.endsWith(".html"))
  .map((relativePath) => {
    if (relativePath === "index.html") return "/";
    if (relativePath.endsWith(`${path.sep}index.html`)) return `/${relativePath.slice(0, -"index.html".length).replaceAll(path.sep, "/")}`;
    return `/${relativePath.replaceAll(path.sep, "/")}`;
  });

fs.writeFileSync(
  path.join(outputDir, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: https://${domain}/sitemap.xml\n`,
  "utf8"
);

fs.writeFileSync(
  path.join(outputDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${htmlPaths
    .map((route) => `  <url><loc>https://${domain}${route}</loc><lastmod>${today}</lastmod></url>`)
    .join("\n")}\n</urlset>\n`,
  "utf8"
);
