import { Context } from "hono";
import RedirectService from "../../service/redirect/redirect-service.js";
import { OUO_HOSTS } from "../../source/web/ouo.js";

export const REDIRECT = "redirect";
export async function redirectApiHandler(c: Context) {
  const args = c.req.param("args");
  console.log("args", args);
  if (!args) {
    return c.text("Missing parameters", 400);
  }
  const [protocol, path, season, episode] = args.split(":");
  if (!protocol || !path || !season || !episode) {
    return c.text("Invalid URL", 400);
  }
  if (!OUO_HOSTS.some((host) => args.includes(host))) {
    return c.text("Invalid URL", 400);
  }

  try {
    const url = `${protocol}:${path}`;
    return RedirectService.resolveRedirectUrl(url, c, episode);
  } catch {
    return c.text("Invalid request", 400);
  }
}
