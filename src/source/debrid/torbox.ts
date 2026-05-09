import { TorboxApi } from "@torbox/torbox-api";
import axios, { AxiosError, AxiosHeaders } from "axios";
import { UserConfig } from "../../lib/manifest.js";
import { hashMD5 } from "../../utils/crypto.js";
import { ENV } from "../../utils/env.js";
import { handleError, TorboxError } from "../../utils/error.js";
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

export interface WebDownLoadRequest {
  link: string;
  password: string | null;
  name: string | null;
  as_queued: boolean;
  add_only_if_cached: boolean;
}

const logger = new Logger("TORBOX");

export async function checkCache(url: string, config: UserConfig) {
  const torbox = createTorboxClient(config);
  const hash = hashMD5(url);
  try {
    const response =
      await torbox.webDownloadsDebrid.getWebDownloadCachedAvailability("v1", {
        hash: hash,
      });
    console.log(response.data);
    return response.data;
  } catch (error: AxiosError | any) {
    handleError(error, logger, `Fail checkCache ${url}`);
  }
  return null;
}

export async function createWebDownload(link: string, config: UserConfig) {
  const torbox = createTorboxClient(config);
  const response = await torbox.webDownloadsDebrid.createWebDownload("v1", {
    link: link,
  });
  return response.data;
}

function getHeaders(config: UserConfig) {
  const headers = new AxiosHeaders();
  headers.set("Content-Type", "application/x-www-form-urlencoded");
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${config.torboxApiKey}`);
  return headers;
}

export async function createCustomWebDownload(
  webDownLoadRequest: WebDownLoadRequest,
  config: UserConfig,
) {
  var link = webDownLoadRequest.link;
  var password = webDownLoadRequest.password;
  var name = webDownLoadRequest.name;
  var asQueued = webDownLoadRequest.as_queued;
  var addOnlyIfCached = webDownLoadRequest.add_only_if_cached;
  var data = new FormData();
  data.append("link", link);
  data.append("password", password ?? "");
  data.append("name", name ?? "");
  data.append("as_queued", Boolean(asQueued).toString());
  data.append("add_only_if_cached", Boolean(addOnlyIfCached).toString());

  var post = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.torbox.app/v1/api/webdl/createwebdownload",
    data: data,
    headers: getHeaders(config),
  };
  try {
    const response = await axios(post);
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}

function createTorboxClient(config: UserConfig) {
  if (!config.torboxApiKey) {
    throw new TorboxError("TorBox API key is required");
  }
  const torbox = new TorboxApi({
    token: config.torboxApiKey,
    baseUrl: "https://api.torbox.app",
    timeoutMs: ENV.TORBOX_TIMEOUT_MS,
  });
  return torbox;
}
