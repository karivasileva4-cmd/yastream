import { describe, expect, it } from "vitest";
import { postFlareSolverr } from "../../utils/browser/flaresolverr.js";
import { postRedirectedUrlCDP } from "../../utils/browser/puppeteer.js";
import { getSendDownloadUrl } from "./send.js";
import { defaultConfig } from "../../lib/manifest.js";

describe("Send Hoster", () => {
  it("get send stream url", async () => {
    const urls = await getSendDownloadUrl(
      "https://send.now/y52ejnt1f6bb",
      defaultConfig,
    );
    console.log("urls", urls);
    expect(urls).not.toBeNull();
  }, 10000);
  it.skip("get send with post", async () => {
    try {
      const postData =
        "op=download2&id=i8i27stly28q&rand=&referer=&download_a=CONTINUE";
      const data = await postFlareSolverr(
        "https://send.now",
        "send",
        3,
        postData,
      );
      if (!data) return;

      console.log("data", data);
      const streamUrl = await postRedirectedUrlCDP(
        "https://send.now/",
        postData,
        data.solution?.cookies,
        data.solution?.userAgent,
      );
      console.log("res", streamUrl);
      expect(streamUrl).not.toBeNull();
    } catch (error) {
      console.log("error", error);
    }
  }, 10000);
});
