import { cleanUrl } from "../../utils/format.js";

export const PIXELDRAIN_ORIGIN = "https://pixeldrain.com";
export function filterPixeldrainUrls(urls: string[]) {
  return urls
    .filter((url) => url.includes(PIXELDRAIN_ORIGIN))
    .map((url) => cleanUrl(url));
}

export function getPixeldrainDownloadUrl(url: string): string {
  // https://pixeldrain.com/u/wimmXq88 -> https://pixeldrain.com/api/file/wimmXq88
  const id = new URL(url).pathname.split("/").pop();
  if (!id) return url;
  return `https://pixeldrain.com/api/file/${id}`;
}
