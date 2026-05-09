import { describe, expect, it } from "vitest";
import { getOuoFinalUrl } from "./ouo.js";

describe("Ouo Linkshortener", () => {
  it("get ouo final url", async () => {
    const url = "https://ouo.io/QxXGPH";
    const session = "ouo";
    const finalUrl = await getOuoFinalUrl(url, session);
    expect(finalUrl).not.toBeNull();
  }, 30000);
});
