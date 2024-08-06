import { Context, Event, TransactionEvent } from "@tenderly/actions";
import { emitter } from "./emitter";
import { getMinipoolLaunchedEvent } from "./logParsing";
import { SLACK_MINIPOOL_LAUNCHED_TEMPLATE } from "./templates";
import { MinipoolLaunched } from "./types";
import { initServices, nodeHexToID } from "./utils";

const HARDWARE_PROVIDERS: Record<string, string> = {
  "0x9e8a01bb951fb38ff9aa0ddecfcda59c7d92b7e1569928f14e6d7bd3cce2f860": "Artifact",
  "0x0000000000000000000000000000000000000000000000000000000000000000": "Manual",
}
const handleMinipoolLaunchedEvent = async (
  transactionEvent: TransactionEvent,
  minipoolLaunchedEvent: MinipoolLaunched
) => {
  const { nodeID, hardwareProvider } = minipoolLaunchedEvent;
  const hardwareProviderName = HARDWARE_PROVIDERS[hardwareProvider.toLowerCase()];
  if(!hardwareProviderName || hardwareProviderName == "Manual") {
    return console.log("Minipool launch ignored with hardware provider: ", hardwareProviderName, hardwareProvider);
  }
  const slackMessage = await SLACK_MINIPOOL_LAUNCHED_TEMPLATE({
    transactionHash: transactionEvent.hash,
    nodeID: nodeHexToID(nodeID),
    hardwareProviderName,
    owner: transactionEvent.from,
  });
  console.info("Slack message prepared for minipool launched");
  const workflowData = {
    ...slackMessage,
    owner: transactionEvent.from,
    nodeID: nodeHexToID(nodeID),
    nodeIDHex: nodeID.toString(),
    hardwareProviderName,
  };
  await emitter.emit(undefined, workflowData);
};

export const minipoolLaunched = async (context: Context, event: Event) => {
  await initServices(context);
  const transactionEvent = event as TransactionEvent;

  const minipoolLaunchedEvent = await getMinipoolLaunchedEvent(transactionEvent);
  if (minipoolLaunchedEvent) {
    await handleMinipoolLaunchedEvent(transactionEvent, minipoolLaunchedEvent);
  } else {
    throw new Error("No Withdraw or Deposit event found");
  }
};
