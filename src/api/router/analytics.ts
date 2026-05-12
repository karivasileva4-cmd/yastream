import { Context, Hono } from "hono";
import { API, STREAMS, SUBTITLES } from "../../utils/constant.js";
import { ENV } from "../../utils/env.js";

import { ShortManifestResource } from "@stremio-addon/sdk";
import prometheusClient, {
  currentVisitors,
  resourceViews,
  uniqueVisitors,
} from "../../utils/analytic/prometheus.js";
const visitors = new Set<string>();
const analytics = new Hono();
if (ENV.PROMETHEUS_ENABLED) {
  analytics.get("/metrics", async (c) => {
    return c.text(await prometheusClient.register.metrics(), 200, {
      headers: [`Content-Type: ${prometheusClient.register.contentType}`],
    });
  });
}

export function extractHeaderInfo(c: Context) {
  const ip =
    c.req.header("x-forwarded-for") ||
    c.req.header("cf-connecting-ip") ||
    "unknown";
  const country = c.req.header("cf-ipcountry") || "";
  const url = c.req.url;
  const origin = c.req.header("origin") || c.req.header("referer") || "";
  const userAgent = c.req.header("user-agent") || "";
  return { ip, country, url, origin, userAgent };
}
analytics.on(
  "GET",
  [
    "/:configBase64/catalog/*",
    "/:configBase64/meta/*",
    "/:configBase64/stream/*",
    "/:configBase64/subtitles/*",
    "/catalog/*",
    "/meta/*",
    "/stream/*",
    "/subtitles/*",
    `/${API}/${STREAMS}/*`,
    `/${API}/${SUBTITLES}/*`,
  ],
  async (c, next) => {
    const { ip, url, userAgent } = extractHeaderInfo(c);
    const key = `${ip}:${userAgent}`;
    const resource: ShortManifestResource | "api" = url.includes("/catalog")
      ? "catalog"
      : url.includes("/meta")
        ? "meta"
        : url.includes("/stream")
          ? "stream"
          : url.includes("/subtitles")
            ? "subtitles"
            : "api";
    // umami?.track({
    //   ip: ip,
    //   userAgent: userAgent,
    // });
    if (ENV.PROMETHEUS_ENABLED) {
      visitors.add(key);
      setTimeout(
        () => {
          visitors.delete(key);
        },
        15 * 60 * 1000, // 15 minutes
      );
      uniqueVisitors.inc({ ip: ip, user_agent: userAgent });
      resourceViews.inc({ resource: resource });
      currentVisitors.set(visitors.size);
    }
    await next();
  },
);

export default analytics;
