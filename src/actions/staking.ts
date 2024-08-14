import { Context, Event, TransactionEvent } from "@tenderly/actions";
import { getGgpStakedEvent, getGgpWithdrawnEvent } from "./logParsing";
import {
  GGP_STAKING_STAKE_TEMPLATE,
  GGP_STAKING_WITHDRAW_TEMPLATE,
} from "./templates";
import { GGPStaked, GGPWithdrawn, StakerInformation } from "./types";
import { chainCommunicator } from "./chain";
import { STAKING_ADDRESS, STAKING_INTERFACE } from "./constants";
import { initServices } from "./utils";
import { emitter } from "./emitter";
import Staking from "./generated/contracts/Staking";

const handleGgpStakedEvent = async (
  transactionEvent: TransactionEvent,
  ggpStakedEvent: GGPStaked
) => {
  const { from, amount } = ggpStakedEvent;
  const { ggpStaked, isNodeOperator } = await getStakerInformation(from);

  await emitter.emit(
    GGP_STAKING_STAKE_TEMPLATE(
      transactionEvent,
      from,
      amount,
      ggpStaked,
      isNodeOperator
    )
  );
};

const handleGgpWithdrawnEvent = async (
  transactionEvent: TransactionEvent,
  ggpWithdrawnEvent: GGPWithdrawn
) => {
  const { to, amount } = ggpWithdrawnEvent;
  const { ggpStaked, isNodeOperator } = await getStakerInformation(to);

  await emitter.emit(
    GGP_STAKING_WITHDRAW_TEMPLATE(
      transactionEvent,
      to,
      amount,
      ggpStaked,
      isNodeOperator
    )
  );
};

const getStakerInformation = async (
  stakerAddr: string
): Promise<StakerInformation & { isNodeOperator: boolean }> => {
  const stakerIndex = await chainCommunicator.getProvider().readContract({
    address: STAKING_ADDRESS,
    abi: Staking,
    functionName: "requireValidStaker",
    args: [stakerAddr as `0x${string}`],
  });
  const staker = await chainCommunicator.getProvider().readContract({
    address: STAKING_ADDRESS,
    abi: Staking,
    functionName: "getStaker",
    args: [stakerIndex],
  });
  const { avaxStaked, avaxValidatingHighWater } = staker;
  const isNodeOperator = avaxStaked > 0 || avaxValidatingHighWater > 0;
  return { ...staker, isNodeOperator };
};

export const stakeOrWithdraw = async (context: Context, event: Event) => {
  await initServices(context);
  const transactionEvent = event as TransactionEvent;

  const ggpStakedEvent = await getGgpStakedEvent(transactionEvent);
  if (ggpStakedEvent) {
    await handleGgpStakedEvent(transactionEvent, ggpStakedEvent);
  } else {
    const ggpWithdrawnEvent = await getGgpWithdrawnEvent(transactionEvent);
    if (!ggpWithdrawnEvent) {
      throw new Error("No GGPStaked or GGPWithdrawn event found");
    }
    await handleGgpWithdrawnEvent(transactionEvent, ggpWithdrawnEvent);
  }
};
