import { describe, expect, it } from "vitest";
import { getOuoFinalUrl } from "./ouo.js";
import { getDlcFromFilecryptId, getUrlsFromFilecrypt } from "./filecrypt.js";
import { getUrlsFromDecryptit } from "./decryptit.js";

describe("Decryptit", () => {
  it("get urls from Decryptit", async () => {
    const dlc = await getDlcFromFilecryptId("023899F466");
    // const dlc = await getDlcFromFilecrypt("DB928233A0");
    if (!dlc) throw new Error("No dlc");
    console.log("dlc", dlc);
    const urls = await getUrlsFromDecryptit(dlc);
    if (!urls) throw new Error("No response");
    console.log("urls", urls);
    expect(urls.length).not.toBe(0);
  }, 30000);
});
