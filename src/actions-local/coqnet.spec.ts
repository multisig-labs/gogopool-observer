import { TestRuntime } from "@tenderly/actions-test";
import { config } from "dotenv";

import { beforeAll, describe, test } from "vitest";

import { coqnetHardwareRented } from "../actions/coqnet";
import { Network } from "@tenderly/actions";

config();

describe("Coqnet Hardware Provider", () => {
  const testRuntime = new TestRuntime();
  beforeAll(() => {
    for (const [key, value] of Object.entries(process.env)) {
      if (value) {
        testRuntime.context.secrets.put(key, value);
      }
    }
  });
  describe("Hardware Rented", () => {
    test.concurrent("hardware rented event", async () => {
      testRuntime.context.metadata.getNetwork = () => Network.FUJI;
      await testRuntime.execute(
        coqnetHardwareRented,
        require("./payload/payload-coqnet-artifact-rented.json")
      );
    });
    test.concurrent("hardware rented event", async () => {
      testRuntime.context.metadata.getNetwork = () => Network.FUJI;
      await testRuntime.execute(
        coqnetHardwareRented,
        require("./payload/payload-coqnet-chorusone-rented.json")
      );
    });
  });
});
