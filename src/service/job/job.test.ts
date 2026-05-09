import { describe, it } from "vitest";
import { startCronJob } from "./job.js";

describe("Job Service", () => {
  it("run job", async () => {
    startCronJob();
  }, 10000);
});
