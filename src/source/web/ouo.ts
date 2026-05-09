import * as cheerio from "cheerio";
import {
  CMD,
  RequestPayload,
  sendFlareSolverr,
} from "../../utils/browser/flaresolverr.js";
import { Logger } from "../../utils/logger.js";
export const OUO_HOSTS = ["ouo.io", "ouo.press"];

const logger = new Logger("OUO");

export async function getOuoFinalUrl(url: string, session: string = "ouo") {
  logger.log(`Get final url with flaresolverr | ${url}`);
  let currentUrl = url;
  let cmd: CMD = "request.get";
  let postData: string | undefined;
  let finalUrl: string | undefined;
  for (let i = 0; i < 3; i++) {
    logger.debug(`round ${i}`);
    logger.debug(`currentUrl ${currentUrl}`);
    const payload: RequestPayload = {
      url: currentUrl,
      cmd: cmd,
      maxTimeout: 20000,
      waitInSeconds: 0,
      session,
    };
    if (postData) payload.postData = postData;
    const data = await sendFlareSolverr(payload);
    logger.trace(`data ${JSON.stringify(data)}`);
    const content = data?.solution?.response;
    finalUrl = data?.solution?.url;
    // parse content
    if (!content) throw new Error("No content");
    if (!OUO_HOSTS.some((host) => finalUrl?.includes(host))) {
      break;
    }
    const $ = cheerio.load(content);
    const parseData = {
      action: $("#form-captcha").attr("action"),
      method: $("#form-captcha").attr("method"),
      token: $('input[name="_token"]').val(),
      cfTurnstileResponse: $('input[name="cf-turnstile-response"]').val(),
      xToken: $('input[name="x-token"]').val(),
      vToken: $('input[name="v-token"]').val(),
    };
    logger.debug(`parseData ${JSON.stringify(parseData)}`);
    if (!parseData.action) {
      parseData.action = $("#form-go").attr("action");
      parseData.method = $("#form-go").attr("method");
      logger.debug(`parseData go ${JSON.stringify(parseData)}`);
    }
    if (!parseData.action) {
      parseData.action = $("#form-shorten").attr("action");
      parseData.method = $("#form-shorten").attr("method");
      logger.debug(`parseData shorten ${JSON.stringify(parseData)}`);
    }
    if (!parseData.action) throw new Error("No redirect url or form action");
    currentUrl = parseData.action;
    cmd =
      parseData.method?.toUpperCase() === "POST"
        ? "request.post"
        : "request.get";
    // application/x-www-form-urlencoded
    // const jsonPostData = JSON.stringify(parseData);
    postData = `_token=${parseData.token}&cf-turnstile-response=${parseData.cfTurnstileResponse}&x-token=${parseData.xToken}&v-token=${parseData.vToken}`;
  }
  logger.log(`Final Url ${finalUrl}`);
  return finalUrl;
}

// TODO: fix concurrent with browser instead of flaresolverr
export async function getOuoFinalUrlBrowser(
  url: string,
  session: string = "ouo",
) {
  logger.log(`Get final url with browser | ${url}`);
  let currentUrl = url;
  let cmd: CMD = "request.get";
  let postData: string | undefined;
  let finalUrl: string | undefined;
  for (let i = 0; i < 3; i++) {
    logger.debug(`round ${i}`);
    logger.debug(`currentUrl ${currentUrl}`);
    const payload: RequestPayload = {
      url: currentUrl,
      cmd: cmd,
      maxTimeout: 20000,
      waitInSeconds: 0,
      session,
    };
    if (postData) payload.postData = postData;
    const data = await sendFlareSolverr(payload);
    logger.trace(`data ${JSON.stringify(data)}`);
    const content = data?.solution?.response;
    finalUrl = data?.solution?.url;
    // parse content
    if (!content) throw new Error("No content");
    if (!OUO_HOSTS.some((host) => finalUrl?.includes(host))) {
      break;
    }
    const $ = cheerio.load(content);
    const parseData = {
      action: $("#form-captcha").attr("action"),
      method: $("#form-captcha").attr("method"),
      token: $('input[name="_token"]').val(),
      cfTurnstileResponse: $('input[name="cf-turnstile-response"]').val(),
      xToken: $('input[name="x-token"]').val(),
      vToken: $('input[name="v-token"]').val(),
    };
    logger.trace(`parseData ${JSON.stringify(parseData)}`);
    if (!parseData.action) {
      parseData.action = $("#form-go").attr("action");
      parseData.method = $("#form-go").attr("method");
      logger.trace(`parseData go ${JSON.stringify(parseData)}`);
    }
    if (!parseData.action) {
      parseData.action = $("#form-shorten").attr("action");
      parseData.method = $("#form-shorten").attr("method");
      logger.trace(`parseData shorten ${JSON.stringify(parseData)}`);
    }
    if (!parseData.action) throw new Error("No redirect url or form action");
    currentUrl = parseData.action;
    cmd =
      parseData.method?.toUpperCase() === "POST"
        ? "request.post"
        : "request.get";
    // application/x-www-form-urlencoded
    // const jsonPostData = JSON.stringify(parseData);
    postData = `_token=${parseData.token}&cf-turnstile-response=${parseData.cfTurnstileResponse}&x-token=${parseData.xToken}&v-token=${parseData.vToken}`;
  }
  logger.log(`Final Url ${finalUrl}`);
  return finalUrl;
}

export function getOuoId(url: string) {
  const ouoId = url.split("/").pop();
  return ouoId;
}
