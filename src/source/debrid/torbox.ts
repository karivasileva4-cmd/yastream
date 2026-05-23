import { TorboxApi } from "@torbox/torbox-api";
import { AxiosError, AxiosHeaders } from "axios";
import { UserConfig } from "../../lib/manifest.js";
import { axiosGet, axiosPost } from "../../utils/axios.js";
import { cache } from "../../utils/cache.js";
import { hashMD5 } from "../../utils/crypto.js";
import { ENV } from "../../utils/env.js";
import {
  handleError,
  TorboxAuthError,
  TorboxError,
} from "../../utils/error.js";
import { Logger } from "../../utils/logger.js";

interface WebDownload {
  id: string;
  name: string;
  status: string;
  progress: number;
  eta: number;
  speed: number;
  size: number;
  links: string[];
  seeds: number;
  peers: number;
  seeds_peers: number;
  dlspeed: number;
  ulspeed: number;
  added_on: number;
  completed_on: number;
  created_on: number;
  modified_on: number;
}

interface TorboxResponse<T> {
  success: boolean;
  error: string;
  detail: string;
  data: T;
}

interface TorboxCreateWebdlResponse {
  hash: string;
  webdownload_id: number;
  auth_id: string;
}

export interface TorboxCheckCacheResponse {
  name: string;
  size: number;
  hash: string;
}
export interface TorboxWebdlRequest {
  link: string;
  asQueued?: boolean;
  addOnlyIfCached?: boolean;
  name?: string;
  password?: string;
}

interface TorboxCheckCacheRequest {
  hashes: string[];
  format?: "object" | "list";
  list_files?: boolean;
}

interface TorboxRequestWebdlRequest {
  webId: string;
}

const logger = new Logger("TORBOX");
const API_VERSION = "v1";
const TORBOX_ORIGIN = "https://api.torbox.app";
const TORBOX_WEBDL_ORIGIN = `${TORBOX_ORIGIN}/${API_VERSION}/api/webdl`;

export async function getTorboxStreamUrl(url: string, config: UserConfig) {
  const cacheKey = `torbox:stream:${url}:${config.tbKey}`;
  const cacheResult: string = cache.get(cacheKey);
  if (cacheResult) return cacheResult;
  const webdl = await createWebdl(
    { link: url, addOnlyIfCached: false, asQueued: false },
    config,
  );
  if (!webdl) return null;
  const webId = webdl.data.webdownload_id.toString();
  // const streamUrl = (await requestWebdl({ webId }, config))?.data;
  const streamUrl = createRedirectRequestWebdl({ webId }, config);
  if (!streamUrl) return null;
  cache.set(cacheKey, streamUrl, 3 * 60 * 60 * 1000);
  return streamUrl;
}

export async function createWebdl(
  request: TorboxWebdlRequest,
  config: UserConfig,
) {
  const headers = getTorboxHeaders(config);
  logger.log(`createWebdl ${request.link}`);
  const { link, password, name, asQueued, addOnlyIfCached } = request;
  const data = new URLSearchParams();
  data.set("link", link);
  data.set("password", password ?? "");
  if (name) data.set("name", name);
  data.set("as_queued", Boolean(asQueued ?? false).toString());
  data.set("add_only_if_cached", Boolean(addOnlyIfCached ?? false).toString());
  const url = `${TORBOX_WEBDL_ORIGIN}/createwebdownload`;
  try {
    const response = await axiosPost<TorboxResponse<TorboxCreateWebdlResponse>>(
      url,
      data.toString(),
      { headers },
    );
    return response;
  } catch (error) {
    handleError(error, logger, `Fail requestDownloadLink ${link}`);
    return null;
  }
}

export async function requestWebdl(
  request: TorboxRequestWebdlRequest,
  config: UserConfig,
) {
  const headers = getTorboxHeaders(config);
  logger.log(`requestWebdl ${request.webId}`);
  const { webId } = request;
  const params = new URLSearchParams();
  params.set("web_id", webId);
  params.set("token", config.tbKey);
  params.set("redirect", "true");
  if (config.ip) params.set("user_ip", config.ip);
  const url = `${TORBOX_WEBDL_ORIGIN}/requestdl`;
  const data = await axiosGet<TorboxResponse<string>>(url, {
    headers,
    params,
  });
  return data;
}

export function createRedirectRequestWebdl(
  request: TorboxRequestWebdlRequest,
  config: UserConfig,
) {
  const { webId } = request;
  const params = new URLSearchParams();
  params.set("web_id", webId);
  params.set("token", config.tbKey);
  params.set("redirect", "true");
  if (config.ip) params.set("user_ip", config.ip);
  const url = `${TORBOX_WEBDL_ORIGIN}/requestdl`;
  const streamUrl = `${url}?${params.toString()}`;
  return streamUrl;
}

export async function checkCache(
  request: TorboxCheckCacheRequest,
  config: UserConfig,
) {
  const headers = getTorboxHeaders(config);
  logger.log(`checkCache ${request.hashes}`);
  const { hashes, format, list_files } = request;
  const params = new URLSearchParams();
  params.set("hash", hashes.join(","));
  params.set("format", "object");
  params.set("list_files", "false");
  if (format) params.set("format", format);
  if (list_files !== undefined) params.set("list_files", String(list_files));
  const url = `${TORBOX_WEBDL_ORIGIN}/checkcached`;
  if (format === "list") {
    const data = (
      await axiosGet<TorboxResponse<TorboxCheckCacheResponse[]>>(url, {
        headers,
        params,
      })
    )?.data;
    return data;
  }
  const data = await axiosGet<
    TorboxResponse<Record<string, TorboxCheckCacheResponse>>
  >(url, { headers, params });
  return data;
}

export async function getCachedMap(urls: string[], config: UserConfig) {
  const cachedMap = new Map<string, boolean>();
  const hashes = urls.map((url) => hashMD5(url));
  const hashesMap = new Map<string, string>();
  hashes.forEach((hash, index) => {
    const url = urls.at(index)!;
    hashesMap.set(hash, url);
    cachedMap.set(url, false);
  });
  try {
    const cacheStreams = await checkCache({ hashes, format: "list" }, config);
    if (cacheStreams) {
      (cacheStreams as TorboxCheckCacheResponse[]).forEach((cacheStream) => {
        const url = hashesMap.get(cacheStream.hash);
        if (url) cachedMap.set(url, true);
      });
    }
  } catch (error) {
    cachedMap.clear();
  }
  return cachedMap;
}

function getTorboxHeaders(config: UserConfig) {
  if (!config.tbKey) throw new TorboxAuthError("TorBox API key is required");
  const headers = new AxiosHeaders();
  headers.set("Content-Type", "application/x-www-form-urlencoded");
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${config.tbKey}`);
  return headers;
}

// Use library (not working)
export async function checkCacheLib(config: UserConfig, url: string) {
  const torbox = createTorboxClient(config);
  const hash = hashMD5(url);
  try {
    const response =
      await torbox.webDownloadsDebrid.getWebDownloadCachedAvailability(
        API_VERSION,
        {
          hash,
        },
      );
    return response.data;
  } catch (error: AxiosError | any) {
    handleError(error, logger, `Fail checkCache ${url}`);
  }
  return null;
}

export async function createWebDownloadLib(config: UserConfig, link: string) {
  try {
    const torbox = createTorboxClient(config);
    const response = await torbox.webDownloadsDebrid.createWebDownload("v1", {
      link: link,
    });
    logger.log(`createWebDownload ${response}`);
    return response.data;
  } catch (error) {
    handleError(error, logger, `Fail createWebDownload ${link}`);
    throw new Error(`Fail createWebDownload ${error}`);
  }
}

export async function requestDownloadLinkLib(
  config: UserConfig,
  webId: string,
) {
  const torbox = createTorboxClient(config);
  const response = await torbox.webDownloadsDebrid.requestDownloadLink2(
    API_VERSION,
    {
      webId: webId,
    },
  );
  return response.data;
}

function createTorboxClient(config: UserConfig) {
  if (!config.tbKey) {
    throw new TorboxAuthError("TorBox API key is required");
  }
  const torbox = new TorboxApi({
    token: config.tbKey,
    baseUrl: "https://api.torbox.app",
    timeoutMs: ENV.TORBOX_TIMEOUT_MS,
  });
  return torbox;
}
