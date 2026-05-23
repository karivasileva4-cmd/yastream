import { describe, expect, it } from "vitest";
import { getPixeldrainDownloadUrl as getPixeldrainStreamUrl } from "./pixeldrain.js";
import { getGofileContent } from "./gofile.js";

describe("Gofile Hoster", () => {
  it("get gofile content", async () => {
    const data = await getGofileContent("3DgzuG");
    console.log("data", data);
    expect(data).not.toBeNull();
  }, 10000);
});
