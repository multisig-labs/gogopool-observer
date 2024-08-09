import { config } from "dotenv";
import { TestRuntime } from "@tenderly/actions-test";

import { beforeAll, describe, test } from "vitest";

import { minipoolLaunched } from "../actions/minipoolLaunch";
import { Network } from "@tenderly/actions";

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
      testRuntime.context.metadata.getNetwork = () => Network.MAINNET
      await testRuntime.execute(
          minipoolLaunched,
          require("./payload/payload-manual-launch.json")
        );
    });
    test.concurrent("fuji launch", async () => {
      testRuntime.context.metadata.getNetwork = () => Network.FUJI
      await testRuntime.execute(
          minipoolLaunched,
          require("./payload/payload-manual-launch.json")
        );
    })
    test.concurrent("artifact launch", async () => {
      testRuntime.context.metadata.getNetwork = () => Network.MAINNET
      await testRuntime.execute(
        minipoolLaunched,
        require("./payload/payload-artifact-launch.json")
      );
    });
    test.concurrent("artifact fuji launch", async () => {
      testRuntime.context.metadata.getNetwork = () => Network.FUJI
      await testRuntime.execute(
        minipoolLaunched,
        require("./payload/payload-artifact-launch.json")
      );
    })
  });
});
