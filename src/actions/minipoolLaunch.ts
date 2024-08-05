import { Context, Event, TransactionEvent } from "@tenderly/actions";
import { emitter } from "./emitter";
import { getMinipoolLaunchedEvent } from "./logParsing";
import { SLACK_MINIPOOL_LAUNCHED_TEMPLATE } from "./templates";
import { MinipoolLaunched } from "./types";
import { initServices, nodeHexToID } from "./utils";

const handleMinipoolLaunchedEvent = async (
  transactionEvent: TransactionEvent,
  minipoolLaunchedEvent: MinipoolLaunched
) => {
  const { nodeID, hardwareProvider } = minipoolLaunchedEvent;

  const slackMessage = await SLACK_MINIPOOL_LAUNCHED_TEMPLATE({
    transactionHash: transactionEvent.hash,
    nodeID: nodeHexToID(nodeID),
    hardwareProviderName: hardwareProvider,
    owner: transactionEvent.from,
  });
  console.info("Slack message prepared for minipool launched");
  const workflowData = {
    ...slackMessage,
    owner: transactionEvent.from,
    nodeID: nodeHexToID(nodeID),
    nodeIDHex: nodeID.toString(),
    hardwareProviderName: hardwareProvider,
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
