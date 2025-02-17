import { WebhookMessageCreateOptions } from "discord.js";
import { Client } from "./emitter";
import { IncomingWebhook, IncomingWebhookSendArguments } from "@slack/webhook";
import { Network } from "@tenderly/actions";
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
      try {
        await webhook.send(slackMessage);
        console.log("sendMessage", "Message sent successfully");
      } catch (error) {
        console.error("Error sending message", error);
      }
    }
  }
}

export const slackClient = new SlackClient();
