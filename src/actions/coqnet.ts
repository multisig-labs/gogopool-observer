import { Context, Event, Network, TransactionEvent } from "@tenderly/actions";
import { formatEther } from "ethers/lib/utils";
import { emitter } from "./emitter";
import { getHardwareRentedEvents } from "./logParsing";
import { SLACK_COQNET_HARDWARE_RENTED_TEMPLATE } from "./templates";
import { HardwareRented } from "./types";
import { initServices, nodeHexToID } from "./utils";

const SUBNET_ID_MAP = [
  {
    name: "CoqNet",
    hex: "0x080fa7727ac2b73292de264684f469732687b61977ae5e95d79727a2e8dd7c54",
  },
  {
    name: "Avalanche",
    hex: "0x0000000000000000000000000000000000000000000000000000000000000000",
  },
] as const;

const getSubnetName = (
  subnetId: string,
  network: Network = Network.MAINNET
) => {
  const subnet = SUBNET_ID_MAP.find((subnet) => subnet.hex === subnetId);
  if (!subnet) {
    return subnetId;
  }
  return subnet.name;
};

export const HARDWARE_PROVIDER_MAP = [
  {
    name: "Artifact",
    id: "0x9e8a01bb951fb38ff9aa0ddecfcda59c7d92b7e1569928f14e6d7bd3cce2f860",
    fujiUrlSecretName: "COQNET_ARTIFACT_FUJI_URL",
    mainnetUrlSecretName: "COQNET_ARTIFACT_MAINNET_URL",
  },
  {
    name: "ChorusOne",
    id: "0x299ee54146ec033ea5775958d91dce74dde4bc03f3b67541fd0ffe59763ec7a3",
    fujiUrlSecretName: "COQNET_CHORUSONE_FUJI_URL",
    mainnetUrlSecretName: "COQNET_CHORUSONE_MAINNET_URL",
  },
  {
    name: "GoGoPool",
    id: "0x2797e64cefb2c97b8db530c89fd2afd138fba588daee473b454803f2bc71b133",
    fujiUrlSecretName: "COQNET_GOGOPOOL_FUJI_URL",
    mainnetUrlSecretName: "COQNET_GOGOPOOL_MAINNET_URL",
  },
] as const;

const getSlackUrl = async (
  hardwareProvider: string,
  network: Network = Network.MAINNET,
  context: Context
) => {
  const slackUrl = HARDWARE_PROVIDER_MAP.find(
    ({ id }) => id === hardwareProvider
  );
  if (!slackUrl) {
    return;
  }
  return network === Network.FUJI
    ? await context.secrets.get(slackUrl?.fujiUrlSecretName)
    : await context.secrets.get(slackUrl?.mainnetUrlSecretName);
};

const handleCoqnetHardwareRentedEvents = async (
  transactionEvent: TransactionEvent,
  coqnetHardwareRentedEvents: HardwareRented[],
  context: Context,
  network?: Network
) => {
  const event = coqnetHardwareRentedEvents[0];
  const hardwareProviderName = HARDWARE_PROVIDER_MAP.find(
    ({ id }) => id === event.hardwareProviderName
  )?.name;

  const nodeID = nodeHexToID(event.nodeID);
  const subnet = getSubnetName(event.subnetID, network);
  if (subnet === "Avalanche") {
    throw new Error("Avalanche subnet is not supported");
  }
  const slackMessage = await SLACK_COQNET_HARDWARE_RENTED_TEMPLATE({
    network,
    transactionHash: transactionEvent.hash,
    user: event.user,
    nodeIDs: [nodeID],
    hardwareProviderName,
    duration: event.duration.toString(),
    payment: formatEther(event.paymentAmount),
    subnetID: event.subnetID,
    subnetName: getSubnetName(event.subnetID, network),
  });

  const slackUrl = await getSlackUrl(
    event.hardwareProviderName,
    network,
    context
  );

  if (!slackUrl) {
    throw new Error(
      "No Slack URL found for hardware provider: " +
        event.hardwareProviderName +
        " on network: " +
        network
    );
  }

  await emitter.emit(
    undefined,
    undefined,
    undefined,
    network,
    slackMessage,
    slackUrl
  );
};

export const coqnetHardwareRented = async (context: Context, event: Event) => {
  await initServices(context);
  const transactionEvent = event as TransactionEvent;
  const network = context.metadata.getNetwork();

  const coqnetHardwareRentedEvents = await getHardwareRentedEvents(
    transactionEvent
  );
  if (coqnetHardwareRentedEvents.length > 0) {
    await handleCoqnetHardwareRentedEvents(
      transactionEvent,
      coqnetHardwareRentedEvents,
      context,
      network
    );
  } else {
    throw new Error("No CoqnetHardwareRented events found");
  }
};
