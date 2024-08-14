import {
  Context,
  Event,
  PeriodicEvent,
  TransactionEvent,
} from "@tenderly/actions";
import { chainCommunicator } from "./chain";
import {
  PROTOCOL_DAO_ADDRESS,
  REWARDS_POOL_ADDRESS
} from "./constants";
import { emitter } from "./emitter";
import ProtocolDAO from "./generated/contracts/ProtocolDAO";
import RewardsPool from "./generated/contracts/RewardsPool";
import {
  REWARDS_ELIGIBILITY_REMINDER_TEMPLATE,
  REWARDS_ENDING_REMINDER_TEMPLATE,
  REWARDS_NEW_CYCLE_TEMPLATE,
} from "./templates";
import { RewardsInformation } from "./types";
import { initServices } from "./utils";

const getRewardsInformation = async (): Promise<RewardsInformation> => {
  const getRewardsCycleStartTime = chainCommunicator
    .getProvider()
    .readContract({
      address: REWARDS_POOL_ADDRESS,
      abi: RewardsPool,
      functionName: "getRewardsCycleStartTime",
    });
  const getRewardsCycleTotalAmt = chainCommunicator.getProvider().readContract({
    address: REWARDS_POOL_ADDRESS,
    abi: RewardsPool,
    functionName: "getRewardsCycleTotalAmt",
  });
  const getRewardsCycleCount = chainCommunicator.getProvider().readContract({
    address: REWARDS_POOL_ADDRESS,
    abi: RewardsPool,
    functionName: "getRewardsCycleCount",
  });
  const getInflationAmt = chainCommunicator.getProvider().readContract({
    address: REWARDS_POOL_ADDRESS,
    abi: RewardsPool,
    functionName: "getInflationAmt",
  });
  const getRewardsCycleSeconds = chainCommunicator.getProvider().readContract({
    address: PROTOCOL_DAO_ADDRESS,
    abi: ProtocolDAO,
    functionName: "getRewardsCycleSeconds",
  });
  const getRewardsEligibilityMinSeconds = chainCommunicator
    .getProvider()
    .readContract({
      address: PROTOCOL_DAO_ADDRESS,
      abi: ProtocolDAO,
      functionName: "getRewardsEligibilityMinSeconds",
    });

  const [
    rewardsCycleStartTime,
    rewardsCycleTotalAmt,
    rewardsCycleCount,
    inflationInformation,
    rewardsCycleSeconds,
    rewardsEligibilityMinSeconds,
  ] = await Promise.all([
    getRewardsCycleStartTime,
    getRewardsCycleTotalAmt,
    getRewardsCycleCount,
    getInflationAmt,
    getRewardsCycleSeconds,
    getRewardsEligibilityMinSeconds,
  ]);

  const rewardsCycleEndTime = rewardsCycleStartTime + rewardsCycleSeconds;
  const rewardsEligibilityTime =
    rewardsCycleStartTime + rewardsEligibilityMinSeconds;
  const inflationAmt = inflationInformation[1] - inflationInformation[0];
  return {
    rewardsCycleStartTime,
    rewardsCycleSeconds,
    rewardsCycleEndTime,
    rewardsCycleTotalAmt,
    rewardsCycleCount,
    inflationAmt,
    rewardsEligibilityMinSeconds,
    rewardsEligibilityTime,
  };
};

const sendRewardsMessage = async (type: RewardsType) => {
  if (type === RewardsType.NONE) return;
  const rewardsInformation = await getRewardsInformation();
  if (type === RewardsType.NEW_REWARDS_CYCLE) {
    await emitter.emit(REWARDS_NEW_CYCLE_TEMPLATE(rewardsInformation));
  } else if (type === RewardsType.ELIGIBILITY_REMINDER) {
    await emitter.emit(
      REWARDS_ELIGIBILITY_REMINDER_TEMPLATE(rewardsInformation)
    );
  } else if (type === RewardsType.CYCLE_ENDING_REMINDER) {
    await emitter.emit(REWARDS_ENDING_REMINDER_TEMPLATE(rewardsInformation));
  } else {
    throw new Error("Invalid rewards type");
  }
};

export enum RewardsType {
  NEW_REWARDS_CYCLE = "NEW_REWARDS_CYCLE",
  ELIGIBILITY_REMINDER = "ELIGIBILITY_REMINDER",
  CYCLE_ENDING_REMINDER = "CYCLE_ENDING_REMINDER",
  NONE = "NONE",
}

const getRewardsType = async (
  time: Date,
  rewardsInformation: RewardsInformation,
  context: Context
): Promise<RewardsType> => {
  console.log(time);
  const now = Math.ceil(time.getTime() / 1000);
  const cycle = Number(rewardsInformation.rewardsCycleCount);

  /* 
    Notify for new cycle
    when? asap when new cycle starts
  */

  const hasNotifiedForNewCycle =
    (await context.storage.getNumber(RewardsType.NEW_REWARDS_CYCLE)) === cycle;
  const shouldNotifyForNewCycle =
    rewardsInformation.rewardsCycleStartTime < now &&
    rewardsInformation.rewardsEligibilityTime - 7n * 24n * 60n * 60n > now;
  if (!hasNotifiedForNewCycle && shouldNotifyForNewCycle) {
    console.log("new cycle");
    await context.storage.putNumber(RewardsType.NEW_REWARDS_CYCLE, cycle);
    return RewardsType.NEW_REWARDS_CYCLE;
  }

  /*
    Notify for eligibility ending
    when? 7 days before the end of eligibility
  */
  const hasNotifiedForEligibility =
    (await context.storage.getNumber(RewardsType.ELIGIBILITY_REMINDER)) ===
    cycle;
  const shouldNotifyForEligibility =
    rewardsInformation.rewardsEligibilityTime - 7n * 24n * 60n * 60n < now &&
    rewardsInformation.rewardsEligibilityTime > now;
  if (!hasNotifiedForEligibility && shouldNotifyForEligibility) {
    await context.storage.putNumber(RewardsType.ELIGIBILITY_REMINDER, cycle);
    return RewardsType.ELIGIBILITY_REMINDER;
  }

  /*
    Notify for cycle ending
    when? 3 days before the end of cycle
  */
  const hasNotifiedForCycleEnding =
    (await context.storage.getNumber(RewardsType.CYCLE_ENDING_REMINDER)) ===
    cycle;
  const shouldNotifyForCycleEnding =
    rewardsInformation.rewardsCycleEndTime - 3n * 24n * 60n * 60n < now &&
    rewardsInformation.rewardsCycleEndTime > now;
  if (!hasNotifiedForCycleEnding && shouldNotifyForCycleEnding) {
    await context.storage.putNumber(RewardsType.CYCLE_ENDING_REMINDER, cycle);
    return RewardsType.CYCLE_ENDING_REMINDER;
  }
  return RewardsType.NONE;
};

export const checkRewardsPeriodic = async (context: Context, event: Event) => {
  await initServices(context);
  const { time } = event as PeriodicEvent;
  const rewardsInformation = await getRewardsInformation();
  return await sendRewardsMessage(
    await getRewardsType(time, rewardsInformation, context)
  );
};

export const rewardsEvent = async (context: Context, event: Event) => {
  await initServices(context);
  const transactionEvent = event as TransactionEvent;
  return transactionEvent;
};
