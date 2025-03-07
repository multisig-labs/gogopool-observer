import { WebhookMessageCreateOptions } from "discord.js";
import { Client } from "./emitter";
import { isDev } from "./constants";

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
      if (isDev) {
        console.log({
          message: "Skipping webhook in development, would have sent",
          body,
          url: this._webhookUrl,
        });
        return;
      }
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
