import { UserConfig } from "../lib/manifest.js";

export function getMediaflowproxyM3u8Url(url: string, config: UserConfig) {
  const mediaflowproxyUrl = config.mfpUrl;
  if (!mediaflowproxyUrl) return url;
  const mediaflowproxyPass = config.mfpPass;
  const proxyUrl = new URL(
    `/proxy/hls/manifest.m3u8?d=${encodeURIComponent(url)}&api_password=${mediaflowproxyPass}`,
    mediaflowproxyUrl,
  ).toString();
  return proxyUrl;
}

export function getMediaflowproxyTranscodeUrl(url: string, config: UserConfig) {
  const mediaflowproxyUrl = config.mfpUrl;
  if (!mediaflowproxyUrl) return url;
  const mediaflowproxyPass = config.mfpPass;
  const proxyUrl = new URL(
    `/proxy/transcode/playlist.m3u8?d=${encodeURIComponent(url)}&api_password=${mediaflowproxyPass}`,
    mediaflowproxyUrl,
  ).toString();
  return proxyUrl;
}
