import { ShortManifestResource } from "@stremio-addon/sdk";
import { Context, Hono } from "hono";
import prometheusClient, {
  clientViews,
  currentVisitors,
  resourceViews,
} from "../../utils/analytic/prometheus.js";
import { umami } from "../../utils/analytic/umami.js";
import { API, STREAMS, SUBTITLES } from "../../utils/constant.js";
import { ENV } from "../../utils/env.js";
import { hashMD5 } from "../../utils/crypto.js";

const analytics = new Hono();
const visitors = new Set<string>();

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

if (ENV.PROMETHEUS_ENABLED) {
  analytics.get("/metrics", async (c) => {
    return c.text(await prometheusClient.register.metrics(), 200, {
      headers: [`Content-Type: ${prometheusClient.register.contentType}`],
    });
  });
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
    const { ip, origin, url, country, userAgent } = extractHeaderInfo(c);
    const key = hashMD5(`${ip}:${userAgent}`);
    const resource: ShortManifestResource | "api" = url.includes("/catalog")
      ? "catalog"
      : url.includes("/meta")
        ? "meta"
        : url.includes("/stream")
          ? "stream"
          : url.includes("/subtitles")
            ? "subtitles"
            : "api";
    if (!visitors.has(key)) {
      umami?.track({ ip, country, origin, userAgent });
    }
    visitors.add(key);
    setTimeout(
      () => {
        visitors.delete(key);
      },
      15 * 60 * 1000, // 15 minutes
    );
    resourceViews?.inc({ resource: resource });
    currentVisitors?.set(visitors.size);
    clientViews?.inc({ key });
    await next();
  },
);

export default analytics;
