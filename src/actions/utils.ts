import {  ethers } from "ethers";

import { BinTools } from "avalanche";
import { Buffer } from "buffer/"; // note: the slash is important!
import ms from "ms";
import { Context, Network } from "@tenderly/actions";
import { discordClient } from "./discord";
import { knockClient } from "./knock";
import { chainCommunicator } from "./chain";
import {
  DISCORD_WEBHOOK_URL_SECRET_NAME,
  JSON_RPC_URL_FUJI_SECRET_NAME,
  JSON_RPC_URL_SECRET_NAME,
  KNOCK_TOKEN_SECRET_NAME,
  WEBHOOK_URL_FUJI_SECRET_NAME,
  WEBHOOK_URL_SECRET_NAME,
} from "./constants";
import { emitter } from "./emitter";
import { webhookClient } from "./webhook";
import { slackClient } from "./slack";

const bintools = BinTools.getInstance();

export const getExplorerUrl = ({network, hash, address}: {network?: Network, hash?: string, address?: string}) => {
  const baseUrl = network === Network.FUJI ? "https://testnet.snowtrace.io" : "https://snowtrace.io";
  if (address) {
    return `${baseUrl}/address/${address}`;
  }
  return `${baseUrl}/tx/${hash}`;
};

export const getAvascanUrl = ({network, nodeID}: {network?: Network, nodeID: string}) => {
  const baseUrl = network === Network.FUJI ? "https://testnet.avascan.info" : "https://avascan.info";
  return `${baseUrl}/staking/validator/${nodeID}`;
};

// Take 0xF29Bce5F34a74301eB0dE716d5194E4a4EA5d7A and return NodeID-P7oB2McjBGgW2NXXWVYjV8JEDFoW9xDE5
const nodeIDToHex = (pk: string) => {
  if (!pk.startsWith("NodeID-")) {
    throw new Error("Error: nodeID must start with 'NodeID-'");
  }
  try {
    const pksplit = pk.split("-");
    const buff = bintools.cb58Decode(pksplit[pksplit.length - 1]);
    return ethers.utils.getAddress(ethers.utils.hexlify(buff));
  } catch (e) {
    throw new Error("Error: nodeID must start with 'NodeID-'");
  }
};

export const nodeHexToID = (h: string) => {
  const b = Buffer.from(ethers.utils.arrayify(ethers.utils.getAddress(h)));
  return `NodeID-${bintools.cb58Encode(b)}`;
};

const randomBytes = (
  seed: string,
  lower: number,
  upper: number | undefined = undefined
) => {
  if (!upper) {
    upper = lower;
  }

  if (upper === 0 && upper === lower) {
    return new Uint8Array(0);
  }

  let result = ethers.utils.arrayify(
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes(seed))
  );
  while (result.length < upper) {
    result = ethers.utils.concat([result, ethers.utils.keccak256(result)]);
  }

  const top = ethers.utils.arrayify(ethers.utils.keccak256(result));
  const percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;

  return result.slice(0, lower + Math.floor((upper - lower) * percent));
};

const emptyWallet = (seed: string) => {
  const pk = randomBytes(seed, 32);
  const w = new ethers.Wallet(pk);
  return w;
};

export const shortenNodeId = (nodeId: string) => {
  return nodeId.slice(0, 12).concat("...").concat(nodeId.slice(-6));
};

// Actual nodeID or random addresses to use for nodeIDs
export const nodeID = (seed: string) => {
  try {
    seed = seed.replace(/[^a-zA-Z0-9-]/gi, "");
    if (seed.startsWith("NodeID-")) {
      return nodeIDToHex(seed);
    } else if (seed.startsWith("0x")) {
      return ethers.utils.getAddress(seed);
    } else {
      return emptyWallet(seed).address;
    }
  } catch (e) {
    return "";
  }
};

export const parseDelta = (delta: string) => {
  const deltaInSeconds = Number.isNaN(Number(delta))
    ? ms(delta) / 1000
    : Number(delta);
  if (!Number.isInteger(deltaInSeconds))
    throw new Error("cannot be called with a non integer value");
  if (deltaInSeconds < 0)
    throw new Error("cannot be called with a negative value");
  return deltaInSeconds;
};

export const randomHexString = (
  seed: string,
  lower: number,
  upper: number | undefined = undefined
) => {
  return ethers.utils.hexlify(randomBytes(seed, lower, upper));
};

// ANR fails lots of txs with gaslimit estimation errors, so override here
export const overrides = {
  gasLimit: 8000000,
};

export const sanitizeNumbers = (input: string): string => {
  const s = input.replace(/[^0-9.]/g, "");
  if (s.length === 0) {
    return "0";
  }
  return s;
};

export const initServices = async (context: Context) => {
  const isFuji = context.metadata.getNetwork() === Network.FUJI;
  console.log("initServices");
  chainCommunicator.init(
    isFuji
      ? await context.secrets.get(JSON_RPC_URL_FUJI_SECRET_NAME)
      : await context.secrets.get(JSON_RPC_URL_SECRET_NAME)
  );
  discordClient.init(
    await context.secrets.get(DISCORD_WEBHOOK_URL_SECRET_NAME)
  );
  // send to discord if `message` included in emit
  emitter.addClient(discordClient);
  console.log(context.metadata.getNetwork());
  webhookClient.init(
    isFuji
      ? await context.secrets.get(WEBHOOK_URL_FUJI_SECRET_NAME)
      : await context.secrets.get(WEBHOOK_URL_SECRET_NAME)
  );
  // send to webhook if `body` included in emit
  emitter.addClient(webhookClient);
  knockClient.init(await context.secrets.get(KNOCK_TOKEN_SECRET_NAME));
  // send to knock if `workflowData` included in emit
  emitter.addClient(knockClient);
  // send to slack if `slackMessage` included in emit
  emitter.addClient(slackClient);
};

export const getOrdinal = (n: number) => {
  let ord = "th";

  if (n % 10 == 1 && n % 100 != 11) {
    ord = "st";
  } else if (n % 10 == 2 && n % 100 != 12) {
    ord = "nd";
  } else if (n % 10 == 3 && n % 100 != 13) {
    ord = "rd";
  }

  return ord;
};

export const getOrdinalDisplay = (n: bigint) => {
  return `${n.toString()}${getOrdinal(Number(n))}`;
};

export const decodeBLSKeys = (blsPubkeyAndSig: string) => {
  try {
    // Validate the input length (dynamic bytes should at least have size prefixes).
    // pubkey is at least 48 and sig is at least 96 bytes
    if (ethers.utils.arrayify(blsPubkeyAndSig).length < 144) {
      return { pubKey: undefined, sig: undefined };
    }

    const decoded = ethers.utils.defaultAbiCoder.decode(
      ["bytes", "bytes"],
      blsPubkeyAndSig
    );

    return {
      pubKey: decoded[0],
      sig: decoded[1],
    };
  } catch (error) {
    console.error({ error });
    return { pubKey: undefined, sig: undefined };
  }
};
 