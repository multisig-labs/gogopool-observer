import { WebhookMessageCreateOptions } from "discord.js";
import { Client } from "./emitter";
import { IncomingWebhook, IncomingWebhookSendArguments } from "@slack/webhook";
import { Network } from "@tenderly/actions";
import { isDev } from "./constants";
export class SlackClient extends Client {
  clientId: string = "slack";
  constructor() {
    super();
  }

  async sendMessage(
    _message: WebhookMessageCreateOptions,
    _workflowData?: any,
    _body?: any,
    _network?: Network,
    slackMessage?: IncomingWebhookSendArguments,
    slackUrl?: string
  ) {
    if (!slackUrl) {
      return;
    } else if (slackMessage) {
      const webhook = new IncomingWebhook(slackUrl);
      console.log("sendMessage", slackUrl);
      if (isDev) {
        return console.log({
          message: "Skipping slack message in development, would have sent",
          slackMessage,
        });
      }
      try {
        await webhook.send(slackMessage);
        console.log("sendMessage", "Message sent successfully");
      } catch (error) {
        throw new Error("Error sending message to slack");
      }
    }
  }
}

export const slackClient = new SlackClient();
