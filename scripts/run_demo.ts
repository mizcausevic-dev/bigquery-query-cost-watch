import { costRisks, optimizationPosture, summary } from "../src/services/bigQueryCostWatchService.js";

console.log("bigquery-query-cost-watch demo");
console.log(summary());
console.log(
  optimizationPosture().map((packet) => ({
    lane: packet.lane,
    owner: packet.owner,
    status: packet.status
  }))
);
console.log(costRisks().slice(0, 3));
