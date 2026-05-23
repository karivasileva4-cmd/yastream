import { describe, expect, it } from "vitest";
import { getOuoFinalUrl } from "./ouo.js";
import * as fs from "fs";
import { getDlcFromFilecryptId, getUrlsFromFilecrypt } from "./filecrypt.js";
import { getEpisodeHosters } from "./filecrypt.js";

describe("Filecrypt", () => {
  it("get urls from filecrypt", async () => {
    // const url = "https://www.filecrypt.cc/Container/ECD932257A.html";
    // const url = "https://www.filecrypt.cc/Container/4F5BF66C00.html";
    const url = "https://filecrypt.cc/Container/39991D10D3.html";
    const episodes = await getUrlsFromFilecrypt(url);
    console.log("episodes", JSON.stringify(episodes, null, 2));
    expect(episodes).not.toBeNull();
  }, 30000);
  it("get dlc from filecrypt", async () => {
    const response = await getDlcFromFilecryptId("023899F466");
    console.log("response", response);
  }, 30000);
  it("get episode hosts", () => {
    const html = fs.readFileSync("./src/source/web/filecrypt.html", "utf8");
    const episodes = getEpisodeHosters(html);
    console.log("episodes", JSON.stringify(episodes, null, 2));
    return episodes;
  });
});
