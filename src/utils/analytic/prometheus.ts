import prometheusClient, { Counter, Gauge } from "prom-client";
import { ENV } from "../env.js";

let resourceViews: Counter | undefined;
let currentVisitors: Gauge | undefined;
let resourceRatelimit: Gauge | undefined;
let clientViews: Counter | undefined;
if (ENV.PROMETHEUS_ENABLED) {
  prometheusClient.collectDefaultMetrics(); // CPU/memory auto-metrics
  resourceViews = new prometheusClient.Counter({
    name: `${ENV.DISPLAY_NAME}_resource_total`,
    help: "Total resource requests",
    labelNames: ["resource"],
  });
  currentVisitors = new prometheusClient.Gauge({
    name: `${ENV.DISPLAY_NAME}_current_visitors`,
    help: "Active unique visitors (15m session)",
  });
  resourceRatelimit = new prometheusClient.Gauge({
    name: `${ENV.DISPLAY_NAME}_resource_ratelimit`,
    help: "Resource that reached rate limit",
    labelNames: ["resource", "key", "wait"],
  });
  clientViews = new prometheusClient.Counter({
    name: `${ENV.DISPLAY_NAME}_ip_total`,
    help: "Total requests per client",
    labelNames: ["key"],
  });
}
export default prometheusClient;
export { clientViews, currentVisitors, resourceRatelimit, resourceViews };
