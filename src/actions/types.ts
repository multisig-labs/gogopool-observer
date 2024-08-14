type Event = {
  address: string;
};

export interface TransferEvent extends Event {
  from: string;
  to: string;
  value: bigint;
}

export interface MinipoolStatusChanged extends Event {
  nodeID: string;
  status: bigint;
}

export interface GGPWithdrawn extends Event {
  to: string;
  amount: bigint;
}

export interface GGPStaked extends Event {
  from: string;
  amount: bigint;
}

export interface GGAVAXWithdraw extends Event {
  caller: string;
  receiver: string;
  owner: string;
  assets: bigint;
  shares: bigint;
}

export interface GGAVAXDeposit extends Event {
  caller: string;
  owner: string;
  assets: bigint;
  shares: bigint;
}

export interface XGGPDeposit extends Event {
  sender: string;
  owner: string;
  assets: bigint;
  shares: bigint;
}

export interface XGGPWithdraw extends Event {
  sender: string;
  receiver: string;
  owner: string;
  assets: bigint;
  shares: bigint;
}

export interface GGPCapUpdated extends Event {
  newMax: bigint;
}

export interface TargetAPRUpdated extends Event {
  newTargetAPR: bigint;
}

export interface HardwareRented extends Event {
  user: string;
  nodeID: string;
  hardwareProviderName: string;
  duration: bigint;
  payment: bigint;
}

export interface MinipoolLaunched extends Event {
  nodeID: string;
  hardwareProvider: string;
  duration: bigint;
}

export interface WithdrawnForStaking extends Event {
  caller: string;
  assets: bigint;
}

export interface DepositedFromStaking extends Event {
  caller: string;
  amount: bigint;
}

export interface RewardsDistributed extends Event {
  amount: bigint;
}

export interface Withdrawl extends Event {
  src: string;
  wad: bigint;
}

export interface AVAXDeposited extends Event {
  by: string;
  amount: bigint;
}

export interface NewStreamlinedMinipoolMade extends Event {
  nodeID: string;
  owner: string;
  hardwareProviderContract: bigint;
}

export enum MinipoolStatus {
  PRELAUNCH = "0",
  LAUNCH = "1",
  STAKING = "2",
  WITHDRAWABLE = "3",
  FINISHED = "4",
  CANCELED = "5",
  ERROR = "6",
  STREAMLINE_PRELAUNCH = "10",
  STREAMLINE_RELAUNCH = "12",
  RESTAKE = "11",
}

export type Minipool = {
  index: bigint;
  nodeID: string;
  status: bigint;
  duration: bigint;
  delegationFee: bigint;
  owner: string;
  multisigAddr: string;
  avaxNodeOpAmt: bigint;
  avaxNodeOpInitialAmt: bigint;
  avaxLiquidStakerAmt: bigint;
  txID: string;
  creationTime: bigint;
  initialStartTime: bigint;
  startTime: bigint;
  endTime: bigint;
  avaxTotalRewardAmt: bigint;
  errorCode: string;
  ggpSlashAmt: bigint;
  avaxNodeOpRewardAmt: bigint;
  blsPubkeyAndSig: string;
  avaxLiquidStakerRewardAmt: bigint;
};

export type StakerInformation = {
  stakerAddr: string;
  avaxAssigned: bigint;
  avaxStaked: bigint;
  avaxValidating: bigint;
  avaxValidatingHighWater: bigint;
  ggpRewards: bigint;
  ggpStaked: bigint;
  lastRewardsCycleCompleted: bigint;
  rewardsStartTime: bigint;
  ggpLockedUntil: bigint;
};

export type RewardsInformation = {
  rewardsCycleStartTime: bigint;
  rewardsCycleEndTime: bigint;
  rewardsCycleTotalAmt: bigint;
  rewardsCycleCount: bigint;
  inflationAmt: bigint;
  rewardsCycleSeconds: bigint;
  rewardsEligibilityMinSeconds: bigint;
  rewardsEligibilityTime: bigint;
};
