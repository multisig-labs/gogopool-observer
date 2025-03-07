import { Client } from "./emitter";
import { Knock } from "@knocklabs/node";
import { Network } from "@tenderly/actions";
import { WebhookMessageCreateOptions } from "discord.js";
import { isDev } from "./constants";

export class KnockClient extends Client {
  _knockClient: Knock | null;
  clientId: string = "knock";
  constructor() {
    super();
    this._knockClient = null;
  }

  init(knockToken: string) {
    if (!this._knockClient) {
      this._knockClient = new Knock(knockToken);
    }
  }

  getKnockClient() {
    return this._knockClient;
  }

  async sendMessage(
    _message: WebhookMessageCreateOptions,
    workflowData?: any,
    body?: any,
    network?: Network
  ) {
    if (!workflowData) {
      console.log("workflowData is undefined");
      return;
    }
    if (!this._knockClient) {
      throw new Error("Knock client not initialized");
    } else if (workflowData) {
      console.log("Sending message to knock");
      let workflowKey =
        network === Network.FUJI
          ? "new-oneclick-minipool-fuji"
          : "new-oneclick-minipool";
      if (workflowData.workflowKey) {
        workflowKey = workflowData.workflowKey;
      }
      // for dev, we don't want our tests triggering knock
      if (isDev) {
        console.log({
          message: "Skipping knock trigger in development, would have sent",
          workflowKey,
          workflowData,
        });
        return;
      }
      await this._knockClient.workflows.trigger(workflowKey, {
        recipients: [
          {
            collection: "webhook-users",
            id: "tenderly",
          },
        ],
        data: {
          ...workflowData,
        },
      });
    }
  }
}

export const knockClient = new KnockClient();
