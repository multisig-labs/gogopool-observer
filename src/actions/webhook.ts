import { WebhookMessageCreateOptions } from "discord.js";
import { Client } from "./emitter";

export class WebhookClient extends Client {
  clientId: string = "webhook";
  _webhookUrl: string | null;
  constructor() {
    super();
    this._webhookUrl = null;
  }

  init(url: string) {
    if (!this._webhookUrl) {
      this._webhookUrl = url;
    }
  }

  async sendMessage(
    _message: WebhookMessageCreateOptions,
    _workflowData?: any,
    body?: any
  ) {
    console.log("sendMessage");
    if (!this._webhookUrl) {
      throw new Error("Webhook client not initialized");
    } else if (body) {
      console.log("sendMessage", this._webhookUrl);
      const respo = await fetch(this._webhookUrl, {
        method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
        body: JSON.stringify(body),
      });

      console.log("sendMessage", respo.status);
    }
  }
}

export const webhookClient = new WebhookClient();
