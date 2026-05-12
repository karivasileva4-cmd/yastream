import prometheusClient from "prom-client";
import { ENV } from "../env.js";

if (ENV.PROMETHEUS_ENABLED) {
  prometheusClient.collectDefaultMetrics(); // CPU/memory auto-metrics
}
export const resourceViews = new prometheusClient.Counter({
  name: `${ENV.DISPLAY_NAME}_resource_total`,
  help: "Total resource requests",
  labelNames: ["resource"],
});

export const uniqueVisitors = new prometheusClient.Gauge({
  name: `${ENV.DISPLAY_NAME}_unique_visitors`,
  help: "Active unique visitors (approx)",
  labelNames: ["ip", "user_agent"],
});

export const currentVisitors = new prometheusClient.Gauge({
  name: `${ENV.DISPLAY_NAME}_current_visitors`,
  help: "Active unique visitors (approx)",
});

export default prometheusClient;
