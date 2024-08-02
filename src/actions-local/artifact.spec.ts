import { config } from "dotenv";
import { TestRuntime } from "@tenderly/actions-test";

import { beforeAll, describe, test } from "vitest";

import { hardwareRented } from "../actions/artifact";

config();

describe("Artifact Hardware Provider", () => {
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
      await testRuntime.execute(
        hardwareRented,
        require("./payload/payload-artifact-rented.json")
      );
    });
  });
});
