import { Context, Event, Network, TransactionEvent } from "@tenderly/actions";
import { emitter } from "./emitter";
import { getHardwareRentedEvents } from "./logParsing";
import { HardwareRented } from "./types";
import { initServices, nodeHexToID } from "./utils";
import { SLACK_HARDWARE_RENTED_TEMPLATE } from "./templates";
import { formatEther } from "ethers/lib/utils";

const handleHardwareRentedEvents = async (
  transactionEvent: TransactionEvent,
  hardwareRentedEvents: HardwareRented[], 
  network?: Network
) => {
  // Group events by user to consolidate messages
  const eventsByUser = hardwareRentedEvents.reduce((acc, event) => {
    const { user } = event;
    if (!acc[user]) acc[user] = [];
    acc[user].push(event);
    return acc;
  }, {} as Record<string, HardwareRented[]>);

  // Send one message per user with all their rented nodes
  for (const [user, events] of Object.entries(eventsByUser)) {
    const nodeIDs = events.map(event => nodeHexToID(event.nodeID));
    const totalPayment = events.reduce((sum, event) => sum + BigInt(event.payment.toString()), BigInt(0));
    const duration = events[0].duration; // Assuming same duration for batch rentals

    const slackMessage = await SLACK_HARDWARE_RENTED_TEMPLATE({
      transactionHash: transactionEvent.hash,
      user,
      nodeIDs,
      hardwareProviderName: events[0].hardwareProviderName,
      duration: duration.toString(),
      payment: formatEther(totalPayment),
    });

    console.info("Slack message prepared for hardware rented");
    const workflowData = {
      ...slackMessage,
      user,
      nodeIDs,
      nodeIDsHex: events.map(event => event.nodeID.toString()),
      hardwareProviderName: events[0].hardwareProviderName,
      duration: duration.toString(),
      payment: totalPayment.toString(),
    };
    await emitter.emit(undefined, workflowData, undefined, network);
  }
};

export const hardwareRented = async (context: Context, event: Event) => {
  await initServices(context);
  const transactionEvent = event as TransactionEvent;
  const network = context.metadata.getNetwork();

  const hardwareRentedEvents = await getHardwareRentedEvents(transactionEvent);
  if (hardwareRentedEvents.length > 0) {
    await handleHardwareRentedEvents(transactionEvent, hardwareRentedEvents, network);
  } else {
    throw new Error("No HardwareRented events found");
  }
};
