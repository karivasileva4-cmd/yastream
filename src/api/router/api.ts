import { Context, Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { resourceRatelimit } from "../../utils/analytic/prometheus.js";
import { STREAMS, SUBTITLES } from "../../utils/constant.js";
import { hashMD5 } from "../../utils/crypto.js";
import { Logger } from "../../utils/logger.js";
import { REDIRECT, redirectApiHandler } from "../controller/redirect-api.js";
import { streamApiHandler } from "../controller/streams-api.js";
import { subtitleApiHandler } from "../controller/subtitles-api.js";
import { extractHeaderInfo } from "./analytics.js";
import { getRetryAfterText, RouteConfig } from "./stremio.js";

interface ApiRouteConfig extends RouteConfig {
  handler: (c: Context) => Promise<Response>;
}

const api = new Hono();
const logger = new Logger("API");
const getLimiter = (
  resource: string,
  windowMs: number = 10 * 60 * 1000,
  limit: number = 40,
) => {
  return rateLimiter({
    windowMs: windowMs,
    limit: limit,
    keyGenerator: (c) => {
      const { ip, userAgent } = extractHeaderInfo(c);
      const key = `${ip}:${userAgent}`;
      return key;
    },
    handler: (c) => {
      const { ip, userAgent } = extractHeaderInfo(c);
      const key = hashMD5(`${ip}:${userAgent}`);
      const remaining = c.res.headers.get("RateLimit-Reset") ?? "5";
      const wait = getRetryAfterText(parseInt(remaining));
      logger.warn(
        `Rate limit | Resource: ${resource}, IP: ${ip}, Wait: ${remaining}s`,
      );
      resourceRatelimit?.inc({
        resource,
        key,
        wait: remaining,
      });
      // umami?.send(
      //   {
      //     website: ENV.UMAMI_WEBSITE_ID,
      //     name: "ratelimit",
      //     data: {
      //       resource: resource,
      //       ip: ip,
      //       wait: wait,
      //       request: c.req.path,
      //     },
      //   },
      //   "event",
      // );
      return c.json(
        {
          message: `Too Many Requests, please wait ${wait}`,
          retryAfter: remaining,
        },
        429,
      );
    },
  });
};
const apiRouteConfigs: ApiRouteConfig[] = [
  {
    route: `/${STREAMS}/:id`,
    limiter: getLimiter(STREAMS),
    handler: streamApiHandler,
  },
  {
    route: `/${SUBTITLES}/:id`,
    limiter: getLimiter(SUBTITLES),
    handler: subtitleApiHandler,
  },
  {
    route: `/${REDIRECT}/:args{.*}`,
    limiter: getLimiter(REDIRECT),
    handler: redirectApiHandler,
  },
];
apiRouteConfigs.forEach((config) => {
  api.use(config.route, config.limiter);
  api.get(config.route, config.handler);
});

export default api;
