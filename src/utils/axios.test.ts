import { describe, expect, it } from "vitest";
import { axiosGet } from "./axios.js";
import { ENV } from "./env.js";

describe("Axios", () => {
  it("get mkvdrama", async () => {
    ENV.KISSKH_USE_FLARESOLVERR = true;
    const data = await axiosGet<string>("https://mkvdrama.net");
    if (!data) throw new Error("No data");
    console.log("data", data.length);
  }, 20000);
});
