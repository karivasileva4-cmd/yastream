import { describe, expect, it } from "vitest";
import { getPixeldrainDownloadUrl as getPixeldrainStreamUrl } from "./pixeldrain.js";

describe("Pixeldrain Hoster", () => {
  it("get pixeldrain stream url", async () => {
    const urls = await getPixeldrainStreamUrl(
      "https://pixeldrain.com/u/wimmXq88",
    );
    console.log("urls", urls);
    expect(urls).not.toBeNull();
  }, 10000);
});
