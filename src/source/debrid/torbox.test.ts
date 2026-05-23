import { describe, expect, it } from "vitest";
import { defaultConfig } from "../../lib/manifest.js";
import { hashMD5 } from "../../utils/crypto.js";
import {
  checkCache,
  checkCacheLib,
  createWebdl,
  requestWebdl,
} from "./torbox.js";

const config = defaultConfig;
config.tbKey = process.env["TORBOX_API_KEY"] || "";

describe("TorBox", () => {
  it("create web download", async () => {
    const data = await createWebdl(
      {
        link: "https://gofile.io/d/fxhWtx",
        addOnlyIfCached: false,
        asQueued: false,
      },
      config,
    );
    // const data = await createWebDownload(config, "https://gofile.io/d/Ue3c5m");
    console.log("data", data);
    expect(data).not.toBeNull();
  }, 10000);
  it("request download link", async () => {
    const data = await requestWebdl({ webId: "948280" }, config);
    console.log("data", data);
    expect(data).not.toBeNull();
  }, 10000);
  it("torbox check cache custom", async () => {
    const data = await checkCache(
      {
        hashes: [
          hashMD5("https://gofile.io/d/Ue3c5m"),
          hashMD5("https://pixeldrain.com/api/file/CrrgsbVb"),
        ],
        format: "list",
      },
      config,
    );
    console.log("data", data);
    expect(data).not.toBeNull();
  }, 10000);
});
