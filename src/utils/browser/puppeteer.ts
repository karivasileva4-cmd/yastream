/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { load } from "cheerio";
import puppeteer, { CookieData, Handler, Page } from "puppeteer";
import { MKVDRAMA_HOST } from "../../source/mkvdrama.js";
import { UA } from "../axios.js";
import { ENV } from "../env.js";
import { handleError } from "../error.js";
import { Logger } from "../logger.js";
import { OUO_HOSTS } from "../../source/web/ouo.js";

const logger = new Logger("PUPPETEER");
export async function getBrowser() {
  return await puppeteer.connect({
    browserWSEndpoint: ENV.PUPPETEER_WS_ENDPOINT, // ws://localhost:3000
    headers: {
      Authorization: `${ENV.PUPPETEER_AUTH_HEADER}`,
    },
  });
}

function parseFormFields(html: string, formSelector: string): string {
  const $ = load(html);
  const form = $(formSelector);
  if (!form.length) return "";

  const params = new URLSearchParams();
  form.find("input").each((_, el) => {
    const name = $(el).attr("name");
    const value = $(el).val();
    if (name && typeof value === "string") {
      params.append(name, value);
    }
  });
  return params.toString();
}

const PAGE_WAIT_MS = 5000;
// export async function getPuppeteerRequest(
//   url: string,
//   cookies?: any,
//   userAgent?: string,
// ) {
//   const browser = await getBrowser();
//   browser.setCookie(...(cookies || []));
//   const page = await browser.newPage();
//   if (userAgent) {
//     page.setUserAgent({ userAgent });
//   }
//   let xhrStatus = null;
//   const downloadDataPromise = page
//     .waitForResponse(
//       (resp) => {
//         if (
//           resp.url().includes("_l_krc_uo") ||
//           resp.url().includes("oe_pq_invxe_l")
//         ) {
//           xhrStatus = resp.status();
//           return resp.status() === 200;
//         }
//         return false;
//       },
//       { timeout: PAGE_WAIT_MS },
//     )
//     .catch(() => null);
//   await page.goto(url, {
//     waitUntil: "load",
//     timeout: 5000,
//   });
//   const downloadResponse = await downloadDataPromise;
//   if (downloadResponse) {
//     logger.log(`Download data XHR completed in ms`);
//     await new Promise((r) => setTimeout(r, 1500));
//   } else {
//     logger.log(
//       `Download XHR not detected (xhr status: ${xhrStatus}), waiting for selectors...`,
//     );
//     try {
//       await page.waitForSelector(".soraddlx, .soraddl, .soradd", {
//         timeout: PAGE_WAIT_MS,
//       });
//       await new Promise((r) => setTimeout(r, 500));
//     } catch {
//       logger.log(
//         `No download sections appeared within ${PAGE_WAIT_MS}ms`,
//       );
//     }
//   }

//   const content = await page.content();
//   // const cookies = await browser.cookies();
//   await browser.close();
//   return { content, cookies };
// }

// export async function postRedirectedUrlCDP(
//   targetUrl: string,
//   postData?: string,
//   cookies?: CookieData[],
//   userAgent?: string,
//   formSelector?: string,
// ) {
//   let redirectedUrl = "";
//   const browser = await getBrowser();
//   if (cookies) browser.setCookie(...cookies);
//   try {
//     const page: Page = await browser.newPage();
//     page.setUserAgent({ userAgent: userAgent || UA });
//     await page.setRequestInterception(true);
//     const client = await page.createCDPSession();
//     await client.send("Network.enable");

//     let formActionUrl = targetUrl;
//     if (formSelector && !postData) {
//       await page.goto(targetUrl, {
//         waitUntil: "domcontentloaded",
//         timeout: 10000,
//       });
//       const html = await page.content();
//       const $ = load(html);
//       formActionUrl = $(formSelector).attr("action") || targetUrl;
//       postData = parseFormFields(html, formSelector);
//       logger.log(`form action ${formActionUrl}`);
//       logger.log(`parsed postData ${postData?.substring(0, 80)}`);
//     }

//     // for (const link of cLinks) {
//     let redirectLocation: string | undefined;
//     const changeToPost: Handler<any> = (interceptRequest) => {
//       var data = {
//         method: "POST",
//         postData: postData,
//       };
//       interceptRequest.continue(data);
//     };
//     const onRequestSent: Handler<any> = (params) => {
//       // Capture redirect response Location header
//       logger.log(`onRequestSent params ${params.documentURL}`);
//       // Also capture any request to an external domain (follow-up after redirect)
//       // Request modified... finish sending!
//       const reqUrl = params.request?.url || "";

//       logger.log(`reqUrl ${reqUrl}`);
//       if (
//         reqUrl.startsWith("http") &&
//         !reqUrl.includes(MKVDRAMA_HOST) &&
//         !reqUrl.includes("cloudflare") &&
//         !reqUrl.includes("google") &&
//         !reqUrl.includes("gstatic") &&
//         !reqUrl.includes("jsdelivr") &&
//         !reqUrl.includes("turnstile")
//       ) {
//         logger.log(`redirectLocation ${redirectLocation}`);
//         if (!redirectLocation) {
//           redirectLocation = reqUrl.split("?__cf_chl")[0];
//           if (redirectLocation) redirectedUrl = redirectLocation;
//         }
//       }
//       return;
//     };

//     page.on("request", changeToPost);
//     client.on("Network.requestWillBeSent", onRequestSent);
//     logger.log(`[MKVDrama/Browser] on request: ${formActionUrl}`);
//     try {
//       // Trigger a navigation to the _c/ URL via fetch (it will fail due to CORS,
//       // but CDP captures the redirect before the CORS error)
//       page.goto(formActionUrl, {
//         waitUntil: "domcontentloaded",
//         timeout: 10000,
//       });
//       // Brief wait for CDP events to arrive
//       await new Promise((r) => setTimeout(r, 500));
//     } catch {}
//     // client.off("Network.requestWillBeSent", onRequestSent);
//     logger.log(`[MKVDrama/Browser] off request: ${targetUrl}`);
//     if (redirectLocation) {
//       logger.log(
//         `[MKVDrama/Browser] _c resolved (CDP): ${targetUrl.split("/_c/")[2]?.substring(0, 12)} → ${redirectLocation.substring(0, 80)}`,
//       );
//       return redirectLocation;
//     }
//     await page.close();

//     // await client.detach().catch(() => {});
//   } catch (cdpErr) {
//     logger.log(`[MKVDrama/Browser] CDP resolution failed: ${cdpErr}`);
//     // Keep remaining unresolved _c/ links as-is
//   } finally {
//     await browser.disconnect();
//   }
//   return redirectedUrl;
// }

/**
 * Turn on capture network events and get redirected url
 * @param targetUrl
 * @param cookies
 * @param userAgent
 * @returns redirectedUrl
 */
export async function getRedirectedUrlCDP(
  targetUrl: string,
  cookies?: CookieData[],
  userAgent?: string,
) {
  let redirectedUrl: string | null = "";
  const browser = await getBrowser();
  if (cookies) browser.setCookie(...cookies);
  try {
    const page: Page = await browser.newPage();
    page.setUserAgent({ userAgent: userAgent || UA });
    const client = await page.createCDPSession();
    await client.send("Network.enable");
    let redirectLocation: string | undefined;
    const onRequestSent: Handler<any> = (params) => {
      // Capture redirect response Location header
      logger.trace(`onRequestSent params ${params.documentURL}`);
      // Also capture any request to an external domain (follow-up after redirect)
      const reqUrl = params.request?.url || "";
      logger.trace(`reqUrl ${reqUrl}`);
      if (
        reqUrl.startsWith("http") &&
        !reqUrl.includes(MKVDRAMA_HOST) &&
        !reqUrl.includes("cloudflare") &&
        !reqUrl.includes("google") &&
        !reqUrl.includes("gstatic") &&
        !reqUrl.includes("jsdelivr") &&
        !reqUrl.includes("turnstile")
      ) {
        logger.trace(`redirectLocation ${redirectLocation}`);
        if (!redirectLocation) {
          redirectLocation = reqUrl.split("?__cf_chl")[0];
          if (redirectLocation) redirectedUrl = redirectLocation;
        }
      }
      if (OUO_HOSTS.some((host) => params.documentURL.includes(host))) {
        redirectLocation = params.documentURL;
        return;
      }
      return;
    };

    client.on("Network.requestWillBeSent", onRequestSent);
    logger.trace(`on request: ${targetUrl}`);
    try {
      // Trigger a navigation to the _c/ URL via fetch (it will fail due to CORS,
      // but CDP captures the redirect before the CORS error)
      await page.goto(targetUrl, {
        waitUntil: "load",
        timeout: ENV.PUPPETEER_TIMEOUT_MS,
      });
      // const content = await page.content();
      // logger.log(`CDP content ${content}`);
      // Brief wait for CDP events to arrive
      await new Promise((r) => setTimeout(r, 500));
    } catch (error) {
      handleError(error, logger, `Fail CDP request ${targetUrl}`);
    }
    client.off("Network.requestWillBeSent", onRequestSent);
    logger.trace(`off request: ${targetUrl}`);
    if (redirectLocation) {
      logger.log(`_c resolved (CDP): ${targetUrl} → ${redirectLocation}`);
      return redirectLocation;
    }

    await client.detach().catch(() => {});
  } catch (cdpErr) {
    logger.error(`CDP resolution failed: ${cdpErr}`);
  } finally {
    await browser.disconnect();
  }
  return redirectedUrl ? redirectedUrl : null;
}

// export async function scrapeWithRemoteBrowser(
//   targetUrl: string,
//   cookies?: CookieData[],
// ) {
//   const browser = await getBrowser();
//   try {
//     if (cookies && cookies.length > 0) browser.setCookie(...cookies);
//     const page: Page = await browser.newPage();
//     logger.log(`broswer cookies ${JSON.stringify(await browser.cookies())}`);
//     page;
//     await page.goto(targetUrl, {
//       waitUntil: "domcontentloaded",
//       timeout: 20000,
//     });
//     logger.log(`page title ${await page.url()}`);
//     // Get your link
//     const rawResult = await page.evaluate(() => {});
//   } finally {
//     // This only closes the TAB, not the whole browser process!
//     await browser.disconnect();
//   }
// }
