import { Context, Event, Network, TransactionEvent } from "@tenderly/actions";
import { formatEther } from "ethers/lib/utils";
import { emitter } from "./emitter";
import { getHardwareRentedEvents } from "./logParsing";
import { SLACK_COQNET_HARDWARE_RENTED_TEMPLATE } from "./templates";
import { HardwareRented } from "./types";
import { initServices, nodeHexToID } from "./utils";

const SUBNET_ID_MAP = [
  {
    name: "CoqNetFuji",
    hex: "0x080fa7727ac2b73292de264684f469732687b61977ae5e95d79727a2e8dd7c54",
  },
  {
    name: "Coqnet",
    hex: "0x0ad6355dc6b82cd375e3914badb3e2f8d907d0856f8e679b2db46f8938a2f012",
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

const CATCHALL_FUJI_URL_NAME = "COQNET_CATCHALL_FUJI_URL";
const CATCHALL_MAINNET_URL_NAME = "COQNET_CATCHALL_MAINNET_URL";

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
  {
    name: "RedRobot",
    id: "0xd9e86ad5e725e04ceb2b2ce8a164cfe3233245a8685a98684d7cce269d8fd706",
    fujiUrlSecretName: "COQNET_REDBOT_FUJI_URL",
    mainnetUrlSecretName: "COQNET_REDBOT_MAINNET_URL",
  },
  {
    name: "BlockchainServicesLabs",
    id: "0xe39baf89b7f3703b97d725a83584603627502da370739e93b3445df9a1d360c3",
    fujiUrlSecretName: "COQNET_BLOCKCHAIN_SERVICES_LABS_FUJI_URL",
    mainnetUrlSecretName: "COQNET_BLOCKCHAIN_SERVICES_LABS_MAINNET_URL",
  },
  {
    name: "Zalutions",
    id: "0xddeb7926393496b0af4a2c706839b1f6651d89e23040fe0d96ec3a906a0cb994",
    fujiUrlSecretName: "COQNET_ZALUTIONS_FUJI_URL",
    mainnetUrlSecretName: "COQNET_ZALUTIONS_MAINNET_URL",
  },
  {
    name: "Proviroll",
    id: "0x5d9a8ab022b792a2f4da2032cd2b87f8758e22a6d44c4eca8c383906fcac5e76",
    fujiUrlSecretName: "COQNET_PROVIROLL_FUJI_URL",
    mainnetUrlSecretName: "COQNET_PROVIROLL_MAINNET_URL",
  },
  {
    name: "Jared",
    id: "0xf52e492a0e83cbaccf712377915f15d9af0a6fd61a3b77ce6a1faf6dfc5a95ad",
    fujiUrlSecretName: "COQNET_JARRED_FUJI_URL",
    mainnetUrlSecretName: "COQNET_JARRED_MAINNET_URL",
  },
  {
    name: "D6cGto6RZnJ",
    id: "0x1600826ef3ad31b6e1a94d4bc80747c43f3ee5a98dbbede474d3fe9ef82ac69b",
    fujiUrlSecretName: "COQNET_D6CGTO6RZNJ_FUJI_URL",
    mainnetUrlSecretName: "COQNET_D6CGTO6RZNJ_MAINNET_URL",
  },
  {
    name: "T3nd0n",
    id: "0x2d0f17a790297cd577e9b6605b9af5cb2d75462335e7a0ca364fd62a9f2c78f2",
    fujiUrlSecretName: "COQNET_T3ND0N_FUJI_URL",
    mainnetUrlSecretName: "COQNET_T3ND0N_MAINNET_URL",
  },
  {
    name: "Spaced",
    id: "0xb560b16361785db6652584f21580d96a6cd5a7bcb97318418ff7081e9e461c87",
    fujiUrlSecretName: "COQNET_SPACED_FUJI_URL",
    mainnetUrlSecretName: "COQNET_SPACED_MAINNET_URL",
  },
  {
    name: "0xNodeRunner",
    id: "0x5388d39baaf86806da9e9bfb3486adb1801b4dc3b60fd6753b02f93b6f171d60",
    fujiUrlSecretName: "COQNET_0XNODERUNNER_FUJI_URL",
    mainnetUrlSecretName: "COQNET_0XNODERUNNER_MAINNET_URL",
  },
  {
    name: "ChristianS",
    id: "0xf57c94b9fbfe60227e6831fb2d060f2199a6bcd0dfaf1acc10a79c248051baec",
    fujiUrlSecretName: "COQNET_CHRISTIANS_FUJI_URL",
    mainnetUrlSecretName: "COQNET_CHRISTIANS_MAINNET_URL",
  },
  {
    name: "BakerMan",
    id: "0x7fa04757ed9871cb83edcd965e83193143ec95c6675d18f49e2125357e017437",
    fujiUrlSecretName: "COQNET_BAKERMAN_FUJI_URL",
    mainnetUrlSecretName: "COQNET_BAKERMAN_MAINNET_URL",
  },
  {
    name: "JoeE",
    id: "0xc5e78f818c4efa36182f181bad78f0382b35ee118295bde2f9fb08b5b8e70942",
    fujiUrlSecretName: "COQNET_JOEE_FUJI_URL",
    mainnetUrlSecretName: "COQNET_JOEE_MAINNET_URL",
  },
  {
    name: "Erwin",
    id: "0xaefde52c7c5abd480ed818b2429947dbb31d8bba7e59f479847d20538933fe6b",
    fujiUrlSecretName: "COQNET_ERWIN_FUJI_URL",
    mainnetUrlSecretName: "COQNET_ERWIN_MAINNET_URL",
  },
  {
    name: "PaulT",
    id: "0x1e8b5c98943dca8af30e5af6d270377cc41b87991db59b5f6d38e95b1f4c1047",
    fujiUrlSecretName: "COQNET_PAULT_FUJI_URL",
    mainnetUrlSecretName: "COQNET_PAULT_MAINNET_URL",
  },
  {
    name: "Spectura",
    id: "0x0b4351be261113545efde39dc1661dd57c3f71be89c27c3824c0ac1a1a3dbec0",
    fujiUrlSecretName: "COQNET_SPECTURA_FUJI_URL",
    mainnetUrlSecretName: "COQNET_SPECTURA_MAINNET_URL",
  },
  {
    name: "HaloAvax",
    id: "0x9c48afcd3866eacdf04e5b51c5f65e10d2722f27b176bf2306fef8e813aa134e",
    fujiUrlSecretName: "COQNET_HALOAVAX_FUJI_URL",
    mainnetUrlSecretName: "COQNET_HALOAVAX_MAINNET_URL",
  },
  {
    name: "Zwetschge",
    id: "0x0c6e413a3617ab6b0528036aa7eb16be52c1afcb38e229884f9c8bf2164e9ed7",
    fujiUrlSecretName: "COQNET_ZWETSCHGE_FUJI_URL",
    mainnetUrlSecretName: "COQNET_ZWETSCHGE_MAINNET_URL",
  },
  {
    name: "Polkachu",
    id: "0x55fcba5b099b252be9d8da4c7c95c468fee9bbec03733b538eb50eca61c3b92a",
    fujiUrlSecretName: "COQNET_POLKACHU_FUJI_URL",
    mainnetUrlSecretName: "COQNET_POLKACHU_MAINNET_URL",
  },
  {
    name: "Scorchio",
    id: "0x6679605cd2482b2cbbc732c30a8e7cfd842d197f1695a03991888f8810670a1e",
    fujiUrlSecretName: "COQNET_SCORCHIO_FUJI_URL",
    mainnetUrlSecretName: "COQNET_SCORCHIO_MAINNET_URL",
  },
  {
    name: "RR",
    id: "0x370061fb9a3bfbe1ced2ba9090b1b46bf2cec519d05432755fbc63039c1721ac",
    fujiUrlSecretName: "COQNET_RR_FUJI_URL",
    mainnetUrlSecretName: "COQNET_RR_MAINNET_URL",
  },
  {
    name: "Sanghren",
    id: "0xb4cff1b019ddd92db550a85368747835c9ea4e93f9e18dd21191b8d4657b10bb",
    fujiUrlSecretName: "COQNET_SANGHREN_FUJI_URL",
    mainnetUrlSecretName: "COQNET_SANGHREN_MAINNET_URL",
  },
] as const;

const getSlackUrl = async (
  hardwareProvider: string,
  network: Network = Network.MAINNET,
  context: Context
) => {
  const slackUrl = HARDWARE_PROVIDER_MAP.find(
    ({ id }) => id.toLowerCase() === hardwareProvider.toLowerCase()
  );
  if (!slackUrl) {
    return network === Network.FUJI
      ? await context.secrets.get(CATCHALL_FUJI_URL_NAME)
      : await context.secrets.get(CATCHALL_MAINNET_URL_NAME);
  }
  return network === Network.FUJI
    ? await context.secrets.get(slackUrl.fujiUrlSecretName)
    : await context.secrets.get(slackUrl.mainnetUrlSecretName);
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
