import { Context } from "hono";
import { REDIRECT } from "../../api/controller/redirect-api.js";
import { UserConfig } from "../../lib/manifest.js";
import { getTorboxStreamUrl } from "../../source/debrid/torbox.js";
import {
  filterPixeldrainUrls,
  getPixeldrainDownloadUrl,
} from "../../source/hoster/pixeldrain.js";
import { getOuoFinalUrl } from "../../source/web/ouo.js";
import { getUrlsFromViewcrate } from "../../source/web/viewcrate.js";
import { API } from "../../utils/constant.js";
import { getOrigin } from "../../utils/domain.js";

class RedirectService {
  static getRedirectApiUrl(args: string) {
    return `${getOrigin()}/${API}/${REDIRECT}/${args}`;
  }

  static getHosterRedirectApiUrl(url: string, config: UserConfig) {
    const config64 = btoa(JSON.stringify(config));
    return `${getOrigin()}/${API}/${config64}/${REDIRECT}/${encodeURIComponent(url)}`;
  }

  static async resolveHosterRedirectUrl(
    url: string,
    c: Context,
    config: UserConfig,
  ) {
    const torboxStreamUrl = await getTorboxStreamUrl(url, config);
    if (!torboxStreamUrl) return c.text("Not found torbox stream url", 404);
    return c.redirect(torboxStreamUrl, 301);
  }

  static async resolveRedirectUrl(url: string, c: Context, episode: string) {
    const viewcrateLink = await getOuoFinalUrl(url);
    if (!viewcrateLink) return c.text("Not found viewcrate link", 404);
    const urls = await getUrlsFromViewcrate(viewcrateLink);
    const pixeldrainUrls = await filterPixeldrainUrls(urls);
    const pixeldrainUrl = pixeldrainUrls[parseInt(episode) - 1];
    if (!pixeldrainUrl) return c.text("Not found pixeldrain link", 404);
    const streamUrl = getPixeldrainDownloadUrl(pixeldrainUrl);
    return c.redirect(streamUrl, 301);
  }
}

export default RedirectService;
