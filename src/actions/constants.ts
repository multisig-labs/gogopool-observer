import { utils } from "ethers";
import ArtifactHardwareProvider from "./generated/contracts/ArtifactHardwareProvider";
import MinipoolManager from "./generated/contracts/MinipoolManager";
import MinipoolStreamliner from "./generated/contracts/MinipoolStreamliner";
import ProtocolDAO from "./generated/contracts/ProtocolDAO";
import RewardsPool from "./generated/contracts/RewardsPool";
import Staking from "./generated/contracts/Staking";
import TokenggAVAX from "./generated/contracts/TokenggAVAX";
import TokenGGP from "./generated/contracts/TokenGGP";
import { abi as GGPVault } from "./abis/ggpvault";
import { abi as Vault } from "./abis/vault";
import { MAINNET_ADDRESSES } from "./generated/addresses/43114";
import { FUJI_ADDRESSES } from "./generated/addresses/43113";
import ArtifactHardwareProviderNew from "./generated/contracts/ArtifactHardwareProviderNew";

export const isDev = process.env.NODE_ENV === "development";

export const TENDERLY_PROJECT_SLUG = "multisiglabs";
export const TENDERLY_USERNAME = "gogopool";
export const JSON_RPC_URL_SECRET_NAME = "JSON_RPC_URL";
export const JSON_RPC_URL_FUJI_SECRET_NAME = "JSON_RPC_URL_FUJI";
export const DISCORD_WEBHOOK_URL_SECRET_NAME = "PROD_WEBHOOK_URL";
export const DATABASE_WEBHOOK_URL_SECRET_NAME = "DATABASE_WEBHOOK_URL";
export const DATABASE_URI_SECRET_NAME = "DATABASE_URI";
export const DATABASE_NAME_SECRET_NAME = "DATABASE_NAME";
export const DATABASE_COLLECTION_SECRET_NAME = "DATABASE_COLLECTION";
export const KNOCK_TOKEN_SECRET_NAME = "KNOCK_TOKEN";
export const WEBHOOK_URL_FUJI_SECRET_NAME = "FUJI_WEBHOOK_URL";
export const WEBHOOK_URL_SECRET_NAME = "WEBHOOK_URL";

export const MINIPOOL_MANAGER_ADDRESS = MAINNET_ADDRESSES.MinipoolManager;
export const MINIPOOL_MANAGER_ADDRESS_FUJI = FUJI_ADDRESSES.MinipoolManager;
export const PROTOCOL_DAO_ADDRESS = MAINNET_ADDRESSES.ProtocolDAO;
export const REWARDS_POOL_ADDRESS = MAINNET_ADDRESSES.RewardsPool;
export const STAKING_ADDRESS = MAINNET_ADDRESSES.Staking;
export const TOKENGG_AVAX_ADDRESS = MAINNET_ADDRESSES.TokenggAVAX;
export const WAVAX_ADDRESS = MAINNET_ADDRESSES.WAVAX;
export const MINIPOOL_STREAMLINER = MAINNET_ADDRESSES.MinipoolStreamliner;

export const MINIPOOL_MANAGER_INTERFACE = new utils.Interface(MinipoolManager);
export const PROTOCOL_DAO_INTERFACE = new utils.Interface(ProtocolDAO);
export const REWARDS_POOL_INTERFACE = new utils.Interface(RewardsPool);
export const STAKING_INTERFACE = new utils.Interface(Staking);
export const TOKEN_GGAVAX_INTERFACE = new utils.Interface(TokenggAVAX);
export const TOKEN_GGP_INTERFACE = new utils.Interface(TokenGGP);
export const VAULT_INTERFACE = new utils.Interface(Vault);
export const MINIPOOL_STREAMLINER_INTERFACE = new utils.Interface(
  MinipoolStreamliner
);
export const GGP_VAULT_INTERFACE = new utils.Interface(GGPVault);
export const HARDWARE_PROVIDER_INTERFACE = new utils.Interface(
  ArtifactHardwareProvider
);
export const HARDWARE_PROVIDER_NEW_INTERFACE = new utils.Interface(
  ArtifactHardwareProviderNew
);
