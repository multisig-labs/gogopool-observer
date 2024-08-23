import { config } from "dotenv";
import { TestRuntime } from "@tenderly/actions-test";

import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { minipoolStatusChange } from "../actions/minipool";
import { undercollateralized } from "../actions/minipoolEjection";
import { emitter } from "../actions/emitter";

config();

describe("Minipool", () => {
  const testRuntime = new TestRuntime();
  beforeAll(() => {
    /*
      -->  Shove all of the .env variables into the test runtime.
      ---> Is there a problem shoving all of them in?
      ->   I hope not.
    */
    for (const [key, value] of Object.entries(process.env)) {
      if (value) {
        testRuntime.context.secrets.put(key, value);
      }
    }
  });
  describe("Undercollateralized", () => {
    test.concurrent("emits for recordStakingEnd", async () => {
      const emitSpy = vi.spyOn(emitter, "emit");
      await testRuntime.execute(
        undercollateralized,
        require("./payload/payload-minipool-undercollateralized.json")
      );
      expect(emitSpy).toHaveBeenCalled();
    });
    test.concurrent(
      "[negative] recordStakingEndThenMaybeCycle shouoldn't emit",
      async () => {
        const emitSpy = vi.spyOn(emitter, "emit");
        await testRuntime.execute(
          undercollateralized,
          require("./payload/payload-minipool-undercollateralized-negative.json")
        );
        expect(emitSpy).not.toHaveBeenCalled();
      }
    );
  });
});
