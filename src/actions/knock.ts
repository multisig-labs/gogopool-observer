import { Client } from "./emitter";
import { Knock } from "@knocklabs/node";
import { WebhookMessageCreateOptions } from "discord.js";

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

  async sendMessage(_message: WebhookMessageCreateOptions, workflowData?: any) {
    if (!workflowData) {
      console.log("workflowData is undefined");
      return;
    }
    if (!this._knockClient) {
      throw new Error("Knock client not initialized");
    } else if (workflowData) {
      console.log("Sending message to knock");
      await this._knockClient.workflows.trigger("new-oneclick-minipool", {
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
