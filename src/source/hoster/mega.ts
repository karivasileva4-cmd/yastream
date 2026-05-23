import { cleanUrl } from "../../utils/format.js";

export const MEGA_HOST = "mega.nz";
export const MEGA_ORIGIN = `https://${MEGA_HOST}`;
export function filterMegaUrls(urls: string[]) {
  return urls
    .filter((url) => url.includes(MEGA_ORIGIN))
    .map((url) => cleanUrl(url));
}
