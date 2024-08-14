import { Context, Event, TransactionEvent } from "@tenderly/actions";
import { chainCommunicator } from "./chain";
import { TOKENGG_AVAX_ADDRESS } from "./constants";
import { emitter } from "./emitter";
import TokenggAVAX from "./generated/contracts/TokenggAVAX";
import { getGgAvaxDepositEvent, getGgAvaxWithdrawEvent } from "./logParsing";
import {
  GGAVAX_DEPOSIT_DISPLAY_TEMPLATE,
  GGAVAX_WITHDRAW_DISPLAY_TEMPLATE,
} from "./templates";
import { GGAVAXDeposit, GGAVAXWithdraw } from "./types";
import { initServices } from "./utils";

const handleGgAvaxDepositEvent = async (
  transactionEvent: TransactionEvent,
  ggpStakedEvent: GGAVAXDeposit
) => {
  const { assets } = ggpStakedEvent;
  const { amountAvailableForStaking } = await getGgAvaxInformation();
  await emitter.emit(
    GGAVAX_DEPOSIT_DISPLAY_TEMPLATE(
      transactionEvent,
      assets,
      amountAvailableForStaking
    )
  );
};

const handleGgAvaxEvent = async (
  transactionEvent: TransactionEvent,
  ggpWithdrawnEvent: GGAVAXWithdraw
) => {
  const { assets } = ggpWithdrawnEvent;
  const { amountAvailableForStaking } = await getGgAvaxInformation();
  await emitter.emit(
    GGAVAX_WITHDRAW_DISPLAY_TEMPLATE(
      transactionEvent,
      assets,
      amountAvailableForStaking
    )
  );
};

const getGgAvaxInformation = async () => {
  const amountAvailableForStakingCallResult = chainCommunicator
    .getProvider()
    .readContract({
      address: TOKENGG_AVAX_ADDRESS,
      functionName: "amountAvailableForStaking",
      abi: TokenggAVAX,
    });
  const stakingTotalAssetsCallResult = chainCommunicator
    .getProvider()
    .readContract({
      address: TOKENGG_AVAX_ADDRESS,
      functionName: "stakingTotalAssets",
      abi: TokenggAVAX,
    });
  const [amountAvailableForStaking, stakingTotalAssets] = await Promise.all([
    amountAvailableForStakingCallResult,
    stakingTotalAssetsCallResult,
  ]);

  return { amountAvailableForStaking, stakingTotalAssets };
};

export const stakeOrWithdraw = async (context: Context, event: Event) => {
  await initServices(context);
  const transactionEvent = event as TransactionEvent;

  const ggAvaxEvent = await getGgAvaxDepositEvent(transactionEvent);
  if (ggAvaxEvent) {
    await handleGgAvaxDepositEvent(transactionEvent, ggAvaxEvent);
  } else {
    const ggAvaxWithdrawEvent = await getGgAvaxWithdrawEvent(transactionEvent);
    if (!ggAvaxWithdrawEvent) {
      throw new Error("No Withdraw or Deposit event found");
    }
    await handleGgAvaxEvent(transactionEvent, ggAvaxWithdrawEvent);
  }
};
