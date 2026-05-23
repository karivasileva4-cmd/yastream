import { cleanUrl } from "../../utils/format.js";

export const PIXELDRAIN_HOST = "pixeldrain.com";
export const PIXELDRAIN_ORIGIN = `https://${PIXELDRAIN_HOST}`;
export function filterPixeldrainUrls(urls: string[]) {
  return urls
    .filter((url) => url.includes(PIXELDRAIN_ORIGIN))
    .map((url) => cleanUrl(url));
}

export function getPixeldrainDownloadUrl(url: string): string {
  // https://pixeldrain.com/u/wimmXq88 -> https://pixeldrain.com/api/file/wimmXq88
  const id = new URL(url).pathname.split("/").pop();
  if (!id) return url;
  return `${PIXELDRAIN_ORIGIN}/api/file/${id}`;
}
