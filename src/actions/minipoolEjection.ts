import { Context, Event, TransactionEvent } from "@tenderly/actions";
import { emitter } from "./emitter";
import { getHardwareProviderName } from "./minipoolLaunch";
import { SLACK_UNDERCOLLATERALIZED_TEMPLATE } from "./templates";
import { initServices, nodeHexToID } from "./utils";
import { getMinipoolFromEvent } from "./minipool";
import { decodeFunctionData } from "viem";
import MinipoolManager from "./generated/contracts/MinipoolManager";

export const undercollateralized = async (context: Context, event: Event) => {
  console.info("Starting minipoolUndercollateralized function");
  await initServices(context);
  const transactionEvent = event as TransactionEvent;

  const { functionName } = decodeFunctionData({
    abi: MinipoolManager,
    data: transactionEvent.input as `0x${string}`,
  });

  if (functionName !== "recordStakingEnd") {
    console.log(`functionName ${functionName} !== recordStakingEnd`);
    return;
  }

  const { minipool } = await getMinipoolFromEvent(
    transactionEvent,
    context.metadata.getNetwork()
  );
  const { owner, duration, nodeID, hardwareProvider } = minipool;
  const hardwareProviderName = getHardwareProviderName(hardwareProvider);
  if (hardwareProviderName === "Artifact") {
    throw new Error("not tracked ; undercollateralized");
  }
  const slackMessage = await SLACK_UNDERCOLLATERALIZED_TEMPLATE({
    transactionHash: transactionEvent.hash,
    owner,
    nodeID: nodeHexToID(nodeID),
  });
  console.info("Slack message prepared for hardware rented");
  const workflowData = {
    ...slackMessage,
    workflowKey: "minipool-ejection",
    user: owner,
    nodeID: nodeHexToID(nodeID),
    nodeIDHex: nodeID.toString(),
    hardwareProviderName,
    duration: duration.toString(),
  };
  await emitter.emit(undefined, workflowData);
};
