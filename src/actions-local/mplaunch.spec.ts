import { config } from "dotenv";
import { TestRuntime } from "@tenderly/actions-test";

import { beforeAll, describe, test } from "vitest";

import { minipoolLaunched } from "../actions/minipoolLaunch";

config();

describe("Minipool Launch", () => {
  const testRuntime = new TestRuntime();
  beforeAll(() => {
    for (const [key, value] of Object.entries(process.env)) {
      if (value) {
        testRuntime.context.secrets.put(key, value);
      }
    }
  });

  describe("Minipool Launch", () => {
    test.concurrent("manual launch", async () => {
      await testRuntime.execute(
        minipoolLaunched,
        require("./payload/payload-manual-launch.json")
      );
    });
    test.concurrent("artifact launch", async () => {
      await testRuntime.execute(
        minipoolLaunched,
        require("./payload/payload-artifact-launch.json")
      );
    });
  });
});
