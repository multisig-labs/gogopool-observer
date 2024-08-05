import { Context, Event, Network, TransactionEvent } from "@tenderly/actions";
import {
  MINIPOOL_MANAGER_ADDRESS,
  MINIPOOL_MANAGER_ADDRESS_FUJI,
  MINIPOOL_MANAGER_INTERFACE,
  MINIPOOL_STREAMLINER_INTERFACE,
} from "./constants";
import {
  MINIPOOL_CANCELED_TEMPLATE,
  MINIPOOL_ERROR_TEMPLATE,
  MINIPOOL_FINISHED_TEMPLATE,
  MINIPOOL_LAUNCH_TEMPLATE,
  MINIPOOL_PRELAUNCH_TEMPLATE,
  MINIPOOL_RESTAKE_TEMPLATE,
  MINIPOOL_STAKING_TEMPLATE,
  MINIPOOL_STREAMLINE_TEMPLATE,
  MINIPOOL_WITHDRAWABLE_TEMPLATE,
} from "./templates";
import { getMatchingEvents } from "./logParsing";
import {
  Minipool,
  MinipoolStatus,
  MinipoolStatusChanged,
  NewStreamlinedMinipoolMade,
} from "./types";
import { jsonRpcProvider } from "./ethers";
import { WebhookMessageCreateOptions } from "discord.js";
import { initServices } from "./utils";
import { emitter } from "./emitter";
import { BigNumber } from "ethers";

export const getMinipoolDataFromNodeId = async (
  nodeID: string,
  network?: Network
): Promise<Minipool> => {
  const minipoolCallResult = await jsonRpcProvider.getProvider().call({
    to: network === Network.FUJI ? MINIPOOL_MANAGER_ADDRESS_FUJI : MINIPOOL_MANAGER_ADDRESS,
    data: MINIPOOL_MANAGER_INTERFACE.encodeFunctionData("getMinipoolByNodeID", [
      nodeID,
    ]),
  });
  const minipoolResult = MINIPOOL_MANAGER_INTERFACE.decodeFunctionResult(
    "getMinipoolByNodeID",
    minipoolCallResult
  )[0];
  return minipoolResult;
};

const getMessageFromStatusChangedEvent = async (
  statusChangedEvent: MinipoolStatusChanged,
  transactionEvent: TransactionEvent,
  duration: BigNumber,
  startTime: BigNumber,
  owner: string,
  status?: MinipoolStatus
): Promise<WebhookMessageCreateOptions> => {
  const { nodeID } = statusChangedEvent;
  if (!status) {
    status = statusChangedEvent.status.toString() as MinipoolStatus;
  }
  switch (status.toString()) {
    case MinipoolStatus.PRELAUNCH:
      return MINIPOOL_PRELAUNCH_TEMPLATE(
        transactionEvent,
        nodeID,
        transactionEvent.from,
        duration.toString()
      );
    case MinipoolStatus.LAUNCH:
      return MINIPOOL_LAUNCH_TEMPLATE(
        transactionEvent,
        nodeID,
        owner,
        duration.toString(),
        startTime.add(duration).toString()
      );

    case MinipoolStatus.STAKING:
      return MINIPOOL_STAKING_TEMPLATE(
        transactionEvent,
        nodeID,
        owner,
        duration.toString(),
        startTime.add(duration).toString()
      );

    case MinipoolStatus.WITHDRAWABLE:
      return MINIPOOL_WITHDRAWABLE_TEMPLATE(
        transactionEvent,
        nodeID,
        owner,
        duration.toString(),
        startTime.add(duration).toString()
      );

    case MinipoolStatus.ERROR:
      return MINIPOOL_ERROR_TEMPLATE(
        transactionEvent,
        nodeID,
        owner,
        duration.toString(),
        startTime.add(duration).toString()
      );

    case MinipoolStatus.CANCELED:
      return MINIPOOL_CANCELED_TEMPLATE(
        transactionEvent,
        nodeID,
        owner,
        duration.toString(),
        startTime.add(duration).toString()
      );

    case MinipoolStatus.FINISHED:
      return MINIPOOL_FINISHED_TEMPLATE(
        transactionEvent,
        nodeID,
        owner,
        duration.toString(),
        startTime.add(duration).toString()
      );

    case MinipoolStatus.RESTAKE:
      return MINIPOOL_RESTAKE_TEMPLATE(
        transactionEvent,
        nodeID,
        owner,
        duration.toString(),
        startTime.add(duration).toString()
      );

    case MinipoolStatus.STREAMLINE_PRELAUNCH:
      return MINIPOOL_STREAMLINE_TEMPLATE(
        transactionEvent,
        nodeID,
        owner,
        duration.toString()
      );

    case MinipoolStatus.STREAMLINE_RELAUNCH:
      return MINIPOOL_RESTAKE_TEMPLATE(
        transactionEvent,
        nodeID,
        owner,
        duration.toString(),
        startTime.add(duration).toString(),
        true
      );

    default:
      throw new Error("unknown status");
  }
};

export const minipoolStatusChange = async (context: Context, event: Event) => {
  console.info("Starting minipoolStatusChange function");
  await initServices(context);
  const transactionEvent = event as TransactionEvent;

  const statusChangedEvents = getMatchingEvents<MinipoolStatusChanged>(
    transactionEvent,
    MINIPOOL_MANAGER_INTERFACE,
    "MinipoolStatusChanged"
  );
  console.info(`Found ${statusChangedEvents.length} MinipoolStatusChanged events`);

  let message;
  let workflowData;
  let webhookData;
  if (statusChangedEvents.length === 0) {
    console.error("No MinipoolStatusChanged events found");
    throw new Error("status event not found");
  }
  const nodeID = statusChangedEvents[0].nodeID;
  console.info(`Processing minipool for nodeID: ${nodeID}`);

  const minipool = await getMinipoolDataFromNodeId(nodeID, context.metadata.getNetwork());
  console.debug("Minipool data retrieved", { minipool });

  const { owner, duration, startTime } = minipool;
  if (statusChangedEvents.length === 1) {
    console.info("Processing single MinipoolStatusChanged event");
    const streamlinedMinipoolMadeEvent =
      getMatchingEvents<NewStreamlinedMinipoolMade>(
        transactionEvent,
        MINIPOOL_STREAMLINER_INTERFACE,
        "NewStreamlinedMinipoolMade"
      );
    if (streamlinedMinipoolMadeEvent?.length > 0) {
      console.info("Processing streamlined minipool event");
      message = await getMessageFromStatusChangedEvent(
        statusChangedEvents[0],
        transactionEvent,
        duration,
        startTime,
        owner,
        MinipoolStatus.STREAMLINE_PRELAUNCH
      );
    } else {
      console.info("Processing regular minipool status change");
      message = await getMessageFromStatusChangedEvent(
        statusChangedEvents[0],
        transactionEvent,
        duration,
        startTime,
        owner
      );
    }
    webhookData = {
      nodeID,
      status: statusChangedEvents[0].status.toString(),
      duration: duration.toString(),
      startDate: startTime.toString(),
    };
  } else if (statusChangedEvents.length === 3) {
    console.info("Processing multiple MinipoolStatusChanged events (likely restake)");
    message = await getMessageFromStatusChangedEvent(
      statusChangedEvents[1],
      transactionEvent,
      duration,
      startTime,
      owner,
      MinipoolStatus.RESTAKE
    );
    webhookData = {
      nodeID,
      status: MinipoolStatus.LAUNCH,
      duration: duration.toString(),
      startDate: startTime.toString(),
    };
  } else if (statusChangedEvents.length === 2) {
    console.info("Processing two MinipoolStatusChanged events (likely relaunch)");
    message = await getMessageFromStatusChangedEvent(
      statusChangedEvents[0],
      transactionEvent,
      duration,
      startTime,
      owner,
      MinipoolStatus.PRELAUNCH
    );
    webhookData = {
      nodeID,
      status: MinipoolStatus.PRELAUNCH,
      duration: duration.toString(),
      startDate: startTime.toString(),
    };
  }
  if (!message) {
    console.error("Failed to generate message");
    throw new Error("message not found");
  }
  console.info("Emitting message", { nodeID, status: statusChangedEvents[0].status.toString() });
  await emitter.emit(message, workflowData, webhookData);
  console.info("minipoolStatusChange function completed successfully");
};