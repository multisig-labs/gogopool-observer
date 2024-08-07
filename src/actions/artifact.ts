import { Context, Event, Network, TransactionEvent } from "@tenderly/actions";
import { emitter } from "./emitter";
import { getHardwareRentedEvent } from "./logParsing";
import { HardwareRented } from "./types";
import { initServices, nodeHexToID } from "./utils";
import { SLACK_HARDWARE_RENTED_TEMPLATE } from "./templates";
import { formatEther } from "ethers/lib/utils";

const handleHardwareRentedEvent = async (
  transactionEvent: TransactionEvent,
  hardwareRentedEvent: HardwareRented, 
  network?: Network
) => {
  const { user, nodeID, hardwareProviderName, duration, payment } =
    hardwareRentedEvent;

  const slackMessage = await SLACK_HARDWARE_RENTED_TEMPLATE({
    transactionHash: transactionEvent.hash,
    user,
    nodeID: nodeHexToID(nodeID),
    hardwareProviderName,
    duration: duration.toString(),
    payment: formatEther(payment),
  });
  console.info("Slack message prepared for hardware rented");
  const workflowData = {
    ...slackMessage,
    user,
    nodeID: nodeHexToID(nodeID),
    nodeIDHex: nodeID.toString(),
    hardwareProviderName,
    duration: duration.toString(),
    payment: payment.toString(),
  };
  await emitter.emit(undefined, workflowData, undefined, network);
};

export const hardwareRented = async (context: Context, event: Event) => {
  await initServices(context);
  const transactionEvent = event as TransactionEvent;
  const network = context.metadata.getNetwork()

  const hardwareRentedEvent = await getHardwareRentedEvent(transactionEvent);
  if (hardwareRentedEvent) {
    await handleHardwareRentedEvent(transactionEvent, hardwareRentedEvent, network);
  } else {
    throw new Error("No Withdraw or Deposit event found");
  }
};
