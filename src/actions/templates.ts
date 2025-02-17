import { Network, TransactionEvent } from "@tenderly/actions";
// import { formatDistance } from "date-fns";
import {
  APIEmbedField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { utils } from "ethers";
import {
  getAvascanUrl,
  getExplorerUrl,
  getOrdinalDisplay,
  nodeHexToID,
} from "./utils";
import { RewardsInformation, XGGPDeposit } from "./types";
import { getEmojiAddress, getEmojiNodeId } from "./addresses";

const pilotComponent = (owner: string) => {
  return new ButtonBuilder()
    .setEmoji("🧑‍✈️")
    .setLabel("Pilot")
    .setURL(getExplorerUrl({ address: owner }))
    .setStyle(ButtonStyle.Link);
};

const balloonComponent = (nodeId: string) => {
  return new ButtonBuilder()
    .setEmoji("🎈")
    .setLabel("Balloon")
    .setURL(getAvascanUrl({ nodeID: nodeHexToID(nodeId) }))
    .setStyle(ButtonStyle.Link);
};

const liquidStakerComponent = (owner: string) => {
  return new ButtonBuilder()
    .setEmoji("🌊")
    .setLabel("Liquid Staker")
    .setURL(getExplorerUrl({ address: owner }))
    .setStyle(ButtonStyle.Link);
};

const transactionComponent = (hash: string) => {
  return new ButtonBuilder()
    .setEmoji("📝")
    .setLabel("Transaction")
    .setURL(getExplorerUrl({ hash }))
    .setStyle(ButtonStyle.Link);
};

const pilotField = (
  owner: string,
  options?: Partial<APIEmbedField>
): APIEmbedField => {
  return {
    name: "🧑‍✈️ pilot",
    value: getEmojiAddress(utils.getAddress(owner)),
    inline: true,
    ...options,
  };
};

const balloonField = (nodeId: string): APIEmbedField => {
  return {
    name: "🎈 balloon",
    value: getEmojiNodeId(nodeId),
    inline: true,
  };
};

// const tripDurationField = (duration: string): APIEmbedField => {
//   const now = new Date();
//   return {
//     name: "📅 trip duration",
//     value: `${formatDistance(
//       now,
//       new Date(now.getTime() + parseInt(duration) * 1000),
//       {
//         addSuffix: false,
//       }
//     )}`,
//     inline: true,
//   };
// };

const endTimeField = (endTime: string): APIEmbedField => {
  return {
    name: "🕰️ return",
    value: `${new Date(parseInt(endTime) * 1000).toLocaleString()}`,
    inline: true,
  };
};

const minipoolStatusField = (minipoolStatus: string): APIEmbedField => {
  return {
    name: "status",
    value: `${minipoolStatus}`,
    inline: true,
  };
};

const ggpAmountField = (
  amount: bigint,
  options?: Partial<APIEmbedField>
): APIEmbedField => {
  return {
    name: "amount",
    value: `${Number(utils.formatUnits(amount, 18)).toLocaleString()} GGP`,
    inline: true,
    ...options,
  };
};

const differenceField = (
  tokenName: string,
  difference: bigint,
  total: bigint,
  subtraction?: boolean,
  options?: Partial<APIEmbedField>
) => {
  const oldTotal = subtraction ? total + difference : total - difference;
  const differenceString = `${Number(
    utils.formatUnits(oldTotal, 18)
  ).toLocaleString()} ${tokenName} ${subtraction ? "-" : "+"} ${Number(
    utils.formatUnits(difference, 18)
  ).toLocaleString()} ${tokenName} = ${Number(
    utils.formatUnits(total, 18)
  ).toLocaleString()} ${tokenName}`;

  return {
    name: "amount",
    value: differenceString,
    ...options,
  };
};

// const ggpDifferenceField = (
//   difference: bigint,
//   total: bigint,
//   subtraction?: boolean,
//   options?: Partial<APIEmbedField>
// ) => {
//   return differenceField("GGP", difference, total, subtraction, options);
// };

const avaxDifferenceField = (
  difference: bigint,
  total: bigint,
  subtraction?: boolean,
  options?: Partial<APIEmbedField>
) => {
  return differenceField("AVAX", difference, total, subtraction, options);
};

const avaxAmountField = (
  amount: bigint,
  options?: Partial<APIEmbedField>
): APIEmbedField => {
  return {
    name: "amount",
    value: `${Number(utils.formatUnits(amount, 18)).toLocaleString("en-us", {
      minimumFractionDigits: 4,
    })} AVAX`,
    inline: true,
    ...options,
  };
};

const avaxAmountDisplay = (
  amount: bigint,
  options?: Intl.NumberFormatOptions
): string =>
  `**${Number(utils.formatUnits(amount, 18)).toLocaleString("en-us", {
    minimumFractionDigits: 4,
    ...options,
  })} AVAX**`;

const ggpAmountDisplay = (
  amount: bigint,
  options?: Intl.NumberFormatOptions
): string =>
  `**${Number(utils.formatUnits(amount, 18)).toLocaleString("en-us", {
    minimumFractionDigits: 0,
    ...options,
  })} GGP**`;

const ggAvaxAmountField = (
  amount: bigint,
  options?: Partial<APIEmbedField>
): APIEmbedField => {
  return {
    name: "amount",
    value: `${Number(utils.formatUnits(amount, 18)).toLocaleString("en-us", {
      minimumFractionDigits: 4,
    })} ggAVAX`,
    inline: true,
    ...options,
  };
};

const liquidStakerField = (
  owner: string,
  options?: Partial<APIEmbedField>
): APIEmbedField => {
  return {
    name: "🌊 liquid staker",
    value: getEmojiAddress(utils.getAddress(owner)),
    inline: true,
    ...options,
  };
};

const liquidStakerDisplay = (owner: string): string =>
  `[${getEmojiAddress(utils.getAddress(owner))}](${getExplorerUrl({
    address: owner,
  })})`;

const rewardsCycleStartTimeField = (
  time: bigint,
  options?: Partial<APIEmbedField>
): APIEmbedField => {
  return {
    name: "🕐 start time",
    value: `<t:${time}:D>`,
    inline: true,
    ...options,
  };
};

const rewardsCycleEligibilityField = (
  time: bigint,
  options?: Partial<APIEmbedField>
): APIEmbedField => {
  return {
    name: "⌛ eligibility cut-off",
    value: `<t:${time}:D>`,
    inline: true,
    ...options,
  };
};

const rewardsCycleDurationField = (
  duration: bigint,
  options?: Partial<APIEmbedField>
): APIEmbedField => {
  return {
    name: "⏳ duration",
    value: `${duration / (60n * 60n * 24n)} days`,
    inline: true,
    ...options,
  };
};

const rewardsCycleEndTimeField = (
  time: bigint,
  options?: Partial<APIEmbedField>
): APIEmbedField => {
  return {
    name: "🏁 end time",
    value: `<t:${time.toString()}:D>`,
    inline: true,
    ...options,
  };
};

const rewardsCycleTotalRewardsField = (
  totalRewards: bigint,
  options?: Partial<APIEmbedField>
): APIEmbedField => {
  return {
    name: "🎉 total rewards",

    value: `${Number(
      utils.formatUnits(totalRewards, 18)
    ).toLocaleString()} GGP`,
    inline: true,
    ...options,
  };
};

export const MINIPOOL_PRELAUNCH_TEMPLATE = (
  transactionEvent: TransactionEvent,
  nodeId: string,
  owner: string,
  duration: string
) => {
  return {
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        pilotComponent(owner),
        balloonComponent(nodeId),
        transactionComponent(transactionEvent.hash)
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle("🌄  Preparing for Takeoff")
        .setDescription(
          "A minipool is getting ready for a remarkable ride. Node Operator has deposited 1,000 AVAX and is now waiting on liquid staking fuel.\n[📄 the life of a minipool](https://docs.gogopool.com/minipool/how-minipool-works) [📄 minipool statuses](https://docs.gogopool.com/minipool/minipool-statuses)"
        )
        .addFields(
          pilotField(owner),
          balloonField(nodeId),
          //          tripDurationField(duration),
          minipoolStatusField("prelaunch")
        )

        .setColor(0x7ddbd5)
        .setFooter({
          text: "[minipool status change] • prelaunch",
        }),
    ],
  };
};

export const MINIPOOL_STREAMLINE_TEMPLATE = (
  transactionEvent: TransactionEvent,
  nodeId: string,
  owner: string,
  duration: string
) => {
  return {
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        pilotComponent(owner),
        balloonComponent(nodeId),
        transactionComponent(transactionEvent.hash)
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle("🖱️  One-Click Launch Initiated")
        .setDescription(
          "With the magic of a single click, all preparations are complete. The Node Operator has started the journey with 1,111 AVAX, bypassing the complexities of traditional setup. Ready for a rewarding flight?\n[📄 One Click Minipool Guide](https://docs.gogopool.com/minipool/how-one-click-launcher-works)"
        )
        .addFields(
          pilotField(owner),
          balloonField(nodeId),
          //          tripDurationField(duration),
          minipoolStatusField("prelaunch")
        )
        .setColor(0x7ddbd5)
        .setFooter({ text: "[minipool status change] • one-click" }),
    ],
  };
};

export const MINIPOOL_LAUNCH_TEMPLATE = (
  transactionEvent: TransactionEvent,
  nodeId: string,
  owner: string,
  duration: string,
  endTime: string
) => {
  return {
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        pilotComponent(owner),
        balloonComponent(nodeId),
        transactionComponent(transactionEvent.hash)
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle("🚀  Inflated and... Lift-off")
        .setDescription(
          "Hooray! Matched with liquid staker funds, this minipool has fully inflated, and the pilot has climbed aboard. It appears to be raising up up up. Let's hope for a smooth flight.\n[📄 the life of a minipool](https://docs.gogopool.com/minipool/how-minipool-works) [📄 minipool statuses](https://docs.gogopool.com/minipool/minipool-statuses)"
        )
        .addFields(
          pilotField(owner),
          balloonField(nodeId),
          //          tripDurationField(duration),
          minipoolStatusField("launched")
        )

        .setColor(0x7ddbd5)
        .setFooter({ text: "[minipool status change] • launched" }),
    ],
  };
};

export const MINIPOOL_STAKING_TEMPLATE = (
  transactionEvent: TransactionEvent,
  nodeId: string,
  owner: string,
  duration: string,
  endTime: string
) => {
  return {
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        pilotComponent(owner),
        balloonComponent(nodeId),
        transactionComponent(transactionEvent.hash)
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle("⛅  Approached Cruising Altitude")
        .setDescription(
          "Actively validating and discovering rewards, the minipool floats through the staking skies. It will remain in this lofty state until it's time to land.\n[📄 the life of a minipool](https://docs.gogopool.com/minipool/how-minipool-works) [📄 minipool statuses](https://docs.gogopool.com/minipool/minipool-statuses)"
        )
        .addFields(
          pilotField(owner),
          balloonField(nodeId),
          //          tripDurationField(duration),
          endTimeField(endTime),
          minipoolStatusField("staking")
        )

        .setColor(0x7ddbd5)
        .setFooter({ text: "[minipool status change] • staking" }),
    ],
  };
};

export const MINIPOOL_WITHDRAWABLE_TEMPLATE = (
  transactionEvent: TransactionEvent,
  nodeId: string,
  owner: string,
  duration: string,
  endTime: string
) => {
  return {
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        pilotComponent(owner),
        balloonComponent(nodeId),
        transactionComponent(transactionEvent.hash)
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle("🌎  Return to Earth")
        .setDescription(
          "A minipool ripe with rewards descends, and the time has come to collect the treasures we've found in the sky. Prepare for a gentle glide back to the ground.\n[📄 the life of a minipool](https://docs.gogopool.com/minipool/how-minipool-works) [📄 minipool statuses](https://docs.gogopool.com/minipool/minipool-statuses)"
        )
        .addFields(
          pilotField(owner),
          balloonField(nodeId),
          //          tripDurationField(duration),
          minipoolStatusField("withdrawable")
        )

        .setColor(0x7ddbd5)
        .setFooter({ text: "[minipool status change] • withdrawable" }),
    ],
  };
};

export const MINIPOOL_FINISHED_TEMPLATE = (
  transactionEvent: TransactionEvent,
  nodeId: string,
  owner: string,
  duration: string,
  endTime: string
) => {
  return {
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        pilotComponent(owner),
        balloonComponent(nodeId),
        transactionComponent(transactionEvent.hash)
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle("🎉  Celebrating Success")
        .setDescription(
          "A completed and enchanting adventure among the clouds. The minipool is deflated, tokens collected, and memories cherished. Farewell, until we see you again in the staking skies!\n[📄 the life of a minipool](https://docs.gogopool.com/minipool/how-minipool-works) [📄 minipool statuses](https://docs.gogopool.com/minipool/minipool-statuses)"
        )
        .addFields(
          pilotField(owner),
          balloonField(nodeId),
          //          tripDurationField(duration),
          endTimeField(endTime),
          minipoolStatusField("finished")
        )

        .setColor(0x7ddbd5)
        .setFooter({ text: "[minipool status change] • finished" }),
    ],
  };
};

export const MINIPOOL_CANCELED_TEMPLATE = (
  transactionEvent: TransactionEvent,
  nodeId: string,
  owner: string,
  duration: string,
  endTime: string
) => {
  return {
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        pilotComponent(owner),
        balloonComponent(nodeId),
        transactionComponent(transactionEvent.hash)
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle("⚠️  A Hasty Halt to our Hovering")
        .setDescription(
          "Alas, this minipool's journey has been called off. Heading back to terra firma, tokens in tow. A new adventure awaits, as a new flight awaits.\n[📄 the life of a minipool](https://docs.gogopool.com/minipool/how-minipool-works) [📄 minipool statuses](https://docs.gogopool.com/minipool/minipool-statuses)"
        )
        .addFields(
          pilotField(owner),
          balloonField(nodeId),
          //          tripDurationField(duration),
          endTimeField(endTime),
          minipoolStatusField("canceled")
        )

        .setColor(0x33b6ae)
        .setFooter({ text: "[minipool status change] • canceled" }),
    ],
  };
};

export const MINIPOOL_ERROR_TEMPLATE = (
  transactionEvent: TransactionEvent,
  nodeId: string,
  owner: string,
  duration: string,
  endTime: string
) => {
  return {
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        pilotComponent(owner),
        balloonComponent(nodeId),
        transactionComponent(transactionEvent.hash)
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle("❗  Mid-Air Mishap")
        .setDescription(
          "Oh dear, it seems the minipool has encountered a hiccup! Fear not, for we shall set things right and resume our whimsical wanderings through the staking skies.\n[📄 the life of a minipool](https://docs.gogopool.com/minipool/how-minipool-works) [📄 minipool statuses](https://docs.gogopool.com/minipool/minipool-statuses)"
        )
        .addFields(
          pilotField(owner),
          balloonField(nodeId),
          //          tripDurationField(duration),
          endTimeField(endTime),
          minipoolStatusField("error")
        )

        .setColor(0x33b6ae)
        .setFooter({ text: "[minipool status change] • error" }),
    ],
  };
};

export const MINIPOOL_RESTAKE_TEMPLATE = (
  transactionEvent: TransactionEvent,
  nodeId: string,
  owner: string,
  duration: string,
  endTime: string,
  isOneClick: boolean = false
) => {
  return {
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        pilotComponent(owner),
        balloonComponent(nodeId),
        transactionComponent(transactionEvent.hash)
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle("♻️  Another Adventure Begins")
        .setDescription(
          `The ${
            isOneClick ? "streamlined " : ""
          }minipool has completed it's flight and is going out for another. Enjoy the ride!\n[📄 the life of a minipool](https://docs.gogopool.com/minipool/how-minipool-works) [📄 minipool statuses](https://docs.gogopool.com/minipool/minipool-statuses)`
        )
        .addFields(
          pilotField(owner),
          balloonField(nodeId),
          //          tripDurationField(duration),
          minipoolStatusField("finished -> prelaunch -> launched")
        )
        .setColor(0x7ddbd5)
        .setFooter({ text: "[minipool status change] • launched" }),
    ],
  };
};

export const GGP_STAKING_STAKE_TEMPLATE = (
  transactionEvent: TransactionEvent,
  owner: string,
  amount: bigint,
  totalStake: bigint,
  isNodeOperator: boolean
) => {
  const stakingMessage = (isNodeOperator: boolean) =>
    isNodeOperator
      ? "A Node Operator has staked GGP to their minipool(s)."
      : "Someone has staked GGP.";

  return {
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        pilotComponent(owner),
        transactionComponent(transactionEvent.hash)
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle("⬆️  GGP Onboarded.")
        .setDescription(
          `${stakingMessage(
            isNodeOperator
          )}\n[📄 GGP rewards](https://docs.gogopool.com/minipool/how-minipool-works#ggp-rewards-eligibility-and-distribution)`
        )
        .addFields(
          pilotField(owner),
          ggpAmountField(amount, {
            name: "stake amount",
          }),
          ggpAmountField(totalStake, {
            name: "total stake",
          })
        )
        .setColor(0xcb92d9)
        .setFooter({ text: "[staking] • stake" }),
    ],
  };
};

export const GGP_STAKING_WITHDRAW_TEMPLATE = (
  transactionEvent: TransactionEvent,
  owner: string,
  amount: bigint,
  totalStake: bigint,
  isNodeOperator: boolean
) => {
  const unstakingMessage = (isNodeOperator: boolean) =>
    isNodeOperator
      ? "A Node Operator has unstaked GGP from their minipool(s)."
      : "Someone has unstaked GGP.";
  return {
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        pilotComponent(owner),
        transactionComponent(transactionEvent.hash)
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle("⬇️  GGP Dropped Overboard.")
        .setDescription(
          `${unstakingMessage(
            isNodeOperator
          )}\n[📄 GGP rewards](https://docs.gogopool.com/minipool/how-minipool-works#ggp-rewards-eligibility-and-distribution)`
        )
        .addFields(
          pilotField(owner, { inline: false }),
          ggpAmountField(amount, {
            name: "un-stake amount",
          }),
          ggpAmountField(totalStake, {
            name: "total stake",
          })
        )
        .setColor(0xa849c0)
        .setFooter({ text: "[staking] • withdraw" }),
    ],
  };
};

export const GGAVAX_DEPOSIT_TEMPLATE = (
  transactionEvent: TransactionEvent,
  assets: bigint,
  shares: bigint,
  amountAvailableForStaking: bigint
) => {
  return {
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        liquidStakerComponent(transactionEvent.from),
        transactionComponent(transactionEvent.hash)
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle("⬆️ AVAX Fuel Added.")
        .setDescription(
          "AVAX has been deposited to the liquid staking pool and shares of ggAVAX have been minted.\n[📄 liquid staking](https://docs.gogopool.com/liquid-staking/how-liquid-staking-works)"
        )
        .addFields(
          liquidStakerField(transactionEvent.from, { inline: false }),
          avaxAmountField(assets, { name: "amount deposited", inline: true }),
          ggAvaxAmountField(shares, { name: "shares minted" }),
          avaxDifferenceField(assets, amountAvailableForStaking, false, {
            name: "available for staking",
          })
        )
        .setColor(0x8aa0d1)
        .setFooter({ text: "[ggAVAX] • deposit" }),
    ],
  };
};

export const GGAVAX_DEPOSIT_DISPLAY_TEMPLATE = (
  transactionEvent: TransactionEvent,
  assets: bigint,
  amountAvailableForStaking: bigint
) => {
  const title = `⬆️ ${avaxAmountDisplay(
    assets
  )} Added to the Liquid Staking Pool (${avaxAmountDisplay(
    amountAvailableForStaking,
    {
      minimumFractionDigits: 0,
    }
  )})`;

  return {
    embeds: [
      new EmbedBuilder()
        .setDescription(
          `${title}\n\n[⛓️ transaction](${getExplorerUrl({
            hash: transactionEvent.hash,
          })}) [📄 liquid staking](https://docs.gogopool.com/liquid-staking/how-liquid-staking-works) ${liquidStakerDisplay(
            transactionEvent.from
          )}`
        )
        .setColor(0x8aa0d1),
    ],
  };
};

export const GGAVAX_WITHDRAW_TEMPLATE = (
  transactionEvent: TransactionEvent,
  assets: bigint,
  shares: bigint,
  amountAvailableForStaking: bigint
) => {
  return {
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        liquidStakerComponent(transactionEvent.from),
        transactionComponent(transactionEvent.hash)
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle("⬇️ AVAX Fuel Drained.")
        .setDescription(
          "AVAX has been withdrawn from the liquid staking pool and shares of ggAVAX have been burned.\n[📄 liquid staking](https://docs.gogopool.com/liquid-staking/how-liquid-staking-works)"
        )
        .addFields(
          liquidStakerField(transactionEvent.from, { inline: false }),
          ggAvaxAmountField(shares, { name: "shares burned" }),
          avaxAmountField(assets, { name: "amount withdrawn" }),
          avaxDifferenceField(assets, amountAvailableForStaking, true, {
            name: "available for staking",
          })
        )
        .setColor(0x4363aa)
        .setFooter({ text: "[ggAVAX] • withdraw" }),
    ],
  };
};

export const GGAVAX_WITHDRAW_DISPLAY_TEMPLATE = (
  transactionEvent: TransactionEvent,
  assets: bigint,
  amountAvailableForStaking: bigint
) => {
  const title = `⬇️ ${avaxAmountDisplay(
    assets
  )} Drained from Liquid Staking Pool (${avaxAmountDisplay(
    amountAvailableForStaking,
    {
      minimumFractionDigits: 0,
    }
  )})`;

  return {
    embeds: [
      new EmbedBuilder()
        .setDescription(
          `${title}\n\n[⛓️ transaction](${getExplorerUrl({
            hash: transactionEvent.hash,
          })}) [📄 liquid staking](https://docs.gogopool.com/liquid-staking/how-liquid-staking-works) ${liquidStakerDisplay(
            transactionEvent.from
          )}`
        )
        .setColor(0x4363aa),
    ],
  };
};

export const XGGP_DEPOSIT_DISPLAY_TEMPLATE = (
  transactionEvent: TransactionEvent,
  { assets, owner, sender, shares }: XGGPDeposit
) => {
  const title = `📥 ${ggpAmountDisplay(
    assets
  )} Deposited into the [SeaFi Vault](https://seafi.app)`;

  return {
    embeds: [
      new EmbedBuilder()
        .setDescription(
          `${title}\n\n[⛓️ transaction](${getExplorerUrl({
            hash: transactionEvent.hash,
          })}) [📄 vault deposit](https://docs.seafi.app/overview/depositors) ${liquidStakerDisplay(
            transactionEvent.from
          )}`
        )
        .setColor(0xaa5566),
    ],
  };
};

export const XGGP_WITHDRAW_DISPLAY_TEMPLATE = (
  transactionEvent: TransactionEvent,
  assets: bigint,
  address: string
) => {
  const title = `📤 ${ggpAmountDisplay(
    assets
  )} Redeemed from the [SeaFi Vault](https://seafi.app)`;
  return {
    embeds: [
      new EmbedBuilder()
        .setDescription(
          `${title}\n\n[⛓️ transaction](${getExplorerUrl({
            hash: transactionEvent.hash,
          })}) [📄 vault withdraw](https://docs.seafi.app/overview/depositors) ${liquidStakerDisplay(
            transactionEvent.from
          )}`
        )
        .setColor(0xaa4950),
    ],
  };
};

export const XGGP_GGP_CAP_UPDATED_TEMPLATE = (newMax: bigint) => {
  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(`GGP Cap Updated: ${ggpAmountDisplay(newMax)}`)
        .setColor(0xaa4950)
        .setFooter({ text: "[vault] • variables" }),
    ],
  };
};

export const XGGP_TARGET_APR_UPDATED_TEMPLATE = (
  targetAprBasisPoints: bigint
) => {
  // 28 days cycles means 13 cycles per year
  const apr = (targetAprBasisPoints * 13n) / 10000n;
  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(`Target APY Updated: ${apr}%`)
        .setColor(0xaa4950)
        .setFooter({ text: "[vault] • variables" }),
    ],
  };
};

export const XGGP_STAKING_DEPOSIT_TEMPLATE = (
  assets: bigint,
  caller: string
) => {
  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(`⬆️ ${ggpAmountDisplay(assets)} tokens added by ${caller}.`)
        .setDescription(
          `Liquidity in the vault has decreased as GGP was delegated to a GoGoPool staker.\n[📄 vault strategy](https://docs.seafi.app/overview/vault-strategy-node-operation)`
        )
        .setColor(0xaa5566),
    ],
  };
};

export const XGGP_STAKING_WITHDRAW_TEMPLATE = (
  amount: bigint,
  caller: string
) => {
  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(
          `⬇️ ${ggpAmountDisplay(amount)} tokens withdrawn by ${caller}.`
        )
        .setDescription(
          `Liquidity in the vault has increased as GGP was withdrawn from a GoGoPool staker.\n[📄 vault strategy](https://docs.seafi.app/overview/vault-strategy-node-operation)`
        )
        .setColor(0xaa4950),
    ],
  };
};

export const XGGP_STAKING_REWARD_TEMPLATE = (
  transactionEvent: TransactionEvent,
  amount: bigint
) => {
  return {
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        transactionComponent(transactionEvent.hash)
      ),
    ],
    embeds: [
      new EmbedBuilder()
        .setTitle(`🎉 ${ggpAmountDisplay(amount)} Rewarded to the Vault`)
        .setDescription(
          `Rewards have been claimed and distributed to the [SeaFi Vault](https://seafi.app), increasing the value of xGGP.\n[📄 vault strategy](https://docs.seafi.app/overview/vault-strategy-node-operation)`
        )
        .setColor(0xaa4950)
        .setFooter({ text: "[vault] • rewards" }),
    ],
  };
};

export const REWARDS_NEW_CYCLE_TEMPLATE = ({
  rewardsCycleStartTime,
  rewardsEligibilityTime,
  rewardsCycleEndTime,
  rewardsCycleTotalAmt,
  rewardsCycleCount,
}: RewardsInformation) => {
  const cycle = getOrdinalDisplay(rewardsCycleCount + 1n);
  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(
          `💨 ...And They're Off! The ${cycle} Great Flight is Underway`
        )
        .setDescription(
          `The ${cycle} GGP rewards cycle has started. Eligible Node Operators can stake GGP to their minipools to earn rewards. This cycle end: <t:${rewardsCycleEndTime}:R>.
[📄 GGP Rewards](https://docs.gogopool.com/minipool/how-minipool-works#ggp-rewards-eligibility-and-distribution)`
        )
        .addFields(
          rewardsCycleStartTimeField(rewardsCycleStartTime),
          rewardsCycleEligibilityField(rewardsEligibilityTime),
          rewardsCycleEndTimeField(rewardsCycleEndTime),
          rewardsCycleTotalRewardsField(rewardsCycleTotalAmt)
        )
        .setColor(0xaa6343)
        .setFooter({ text: "[rewards] • start" }),
    ],
  };
};

export const REWARDS_ELIGIBILITY_REMINDER_TEMPLATE = ({
  rewardsCycleEndTime,
  rewardsCycleTotalAmt,
  rewardsCycleCount,
  rewardsEligibilityTime,
}: RewardsInformation) => {
  const cycle = getOrdinalDisplay(rewardsCycleCount + 1n);
  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(`ℹ️ Registration Reminder for the ${cycle} Great Flight.`)
        .setDescription(
          `Eligibility cut-off for the ${cycle} rewards period: <t:${rewardsEligibilityTime}:R>. Your minipool must be registered before this time to be eligible. Node operators with registered minipools will receive a share of this cycle's rewards.
[📄 GGP Rewards](https://docs.gogopool.com/minipool/how-minipool-works#ggp-rewards-eligibility-and-distribution)`
        )
        .addFields(
          rewardsCycleEligibilityField(rewardsEligibilityTime),
          rewardsCycleEndTimeField(rewardsCycleEndTime),
          rewardsCycleTotalRewardsField(rewardsCycleTotalAmt, { inline: false })
        )
        .setColor(0xaa6343)
        .setFooter({ text: "[rewards] • eligibility" }),
    ],
  };
};

export const REWARDS_ENDING_REMINDER_TEMPLATE = ({
  rewardsCycleStartTime,
  rewardsCycleSeconds,
  rewardsCycleEndTime,
  rewardsCycleTotalAmt,
  rewardsCycleCount,
}: RewardsInformation) => {
  const cycle = getOrdinalDisplay(rewardsCycleCount + 1n);
  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(`🏁 Ending Reminder for the ${cycle} Great Flight.`)
        .setDescription(
          `The ${cycle} rewards cycle end: <t:${rewardsCycleEndTime}:R>. At that time, eligible Node Operators will receive a share of the rewards for the cycle.
[📄 GGP Rewards](https://docs.gogopool.com/minipool/how-minipool-works#ggp-rewards-eligibility-and-distribution)`
        )
        .addFields(
          rewardsCycleStartTimeField(rewardsCycleStartTime),
          rewardsCycleDurationField(rewardsCycleSeconds),
          rewardsCycleEndTimeField(rewardsCycleEndTime),
          rewardsCycleTotalRewardsField(rewardsCycleTotalAmt)
        )
        .setColor(0xaa6343)
        .setFooter({ text: "[rewards] • end" }),
    ],
  };
};

export const SLACK_STREAMLINED_MINIPOOL_LAUNCH_TEMPLATE = async ({
  network,
  transactionHash,
  blsKey,
  blsSig,
  nodeID,
  nodeIDHex,
  duration,
  startTime,
  owner,
  hardwareProviderContract,
}: {
  network?: Network;
  transactionHash: string;
  blsKey?: string;
  blsSig?: string;
  nodeID: string;
  nodeIDHex: string;
  duration: string;
  startTime: string;
  owner: string;
  hardwareProviderContract: bigint;
}) => {
  const elements = [
    {
      type: "button",
      text: {
        type: "plain_text",
        emoji: true,
        text: ":snowman: Transaction",
      },
      url: getExplorerUrl({ network, hash: transactionHash }),
      action_id: "transaction-hash-link",
    },
    {
      type: "button",
      text: {
        type: "plain_text",
        emoji: true,
        text: ":snowman: Owner",
      },
      url: getExplorerUrl({ network, address: owner }),
      action_id: "owner-link",
    },
    {
      type: "button",
      text: {
        type: "plain_text",
        emoji: true,
        text: ":closed_umbrella: Validator",
      },
      url: getAvascanUrl({ network, nodeID }),
      action_id: "node-id-link",
    },
  ];
  const displayDuration = Math.floor(parseInt(duration) / 86400);
  const displayStartTime = new Date(parseInt(startTime) * 1000).toUTCString();
  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: ":operation-forklift: Streamlined Minipool Launch",
          emoji: true,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `*${displayStartTime}*`,
          },
          {
            type: "mrkdwn",
            text: "|",
          },
          {
            type: "mrkdwn",
            text: `*${displayDuration} days*`,
          },
        ],
      },
      {
        type: "actions",
        elements,
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${nodeID} \`hex:${nodeIDHex}\``,
        },
      }, //
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Hardware Provider* \`${hardwareProviderContract}\``,
        },
      },
      {
        type: "context",
        elements: [
          {
            text: `*BLS Public Key* \`\`\`${blsKey}\`\`\``,
            type: "mrkdwn",
          },
          {
            text: `*BLS Signature* \`\`\`${blsSig}\`\`\``,
            type: "mrkdwn",
          },
        ],
      },
    ],
  };
};

export const SLACK_HARDWARE_RENTED_TEMPLATE = async ({
  network,
  transactionHash,
  user,
  nodeIDs,
  duration,
  payment,
}: {
  network?: Network;
  transactionHash: string;
  user: string;
  nodeIDs: string[];
  hardwareProviderName: string;
  duration: string;
  payment: string;
}) => {
  const headerText =
    network === Network.FUJI
      ? ":female-construction-worker::computer: Hardware Rented (Testnet)"
      : ":computer: Hardware Rented";
  const displayDuration = Math.floor(parseInt(duration) / 86400);

  // Create a section for each node ID
  const nodeIDSections = nodeIDs.map((nodeID) => ({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Node ID:* \`${nodeID}\``,
    },
  }));

  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: headerText,
          emoji: true,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `*Duration:* ${displayDuration} days`,
          },
          {
            type: "mrkdwn",
            text: "|",
          },
          {
            type: "mrkdwn",
            text: `*Payment:* ${payment} AVAX`,
          },
          {
            type: "mrkdwn",
            text: "|",
          },
          {
            type: "mrkdwn",
            text: `*Nodes:* ${nodeIDs.length}`,
          },
        ],
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: ":snowman: Transaction",
            },
            url: getExplorerUrl({ network, hash: transactionHash }),
            action_id: "transaction-hash-link",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: ":bust_in_silhouette: User",
            },
            url: getExplorerUrl({ network, address: user }),
            action_id: "user-link",
          },
        ],
      },
      ...nodeIDSections,
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Hardware Provider:* Artifact`,
        },
      },
    ],
  };
};

export const SLACK_COQNET_HARDWARE_RENTED_TEMPLATE = async ({
  network,
  transactionHash,
  user,
  nodeIDs,
  duration,
  payment,
  hardwareProviderName,
  subnetName,
}: {
  network?: Network;
  transactionHash: string;
  user: string;
  nodeIDs: string[];
  hardwareProviderName?: string;
  duration: string;
  payment: string;
  subnetID: string;
  subnetName?: string;
}) => {
  const headerText =
    network === Network.FUJI
      ? `:female-construction-worker::hatching_chick: ${hardwareProviderName} Hardware Rented (Testnet)`
      : `:hatching_chick: ${hardwareProviderName} Hardware Rented`;
  const displayDuration = Math.floor(parseInt(duration) / 86400);

  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: headerText,
          emoji: true,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `*Duration:* ${displayDuration} days`,
          },
          {
            type: "mrkdwn",
            text: "|",
          },
          {
            type: "mrkdwn",
            text: `*Payment:* ${
              !isNaN(Number(payment))
                ? Number(payment).toLocaleString(undefined, {
                    maximumFractionDigits: 3,
                  })
                : "0"
            } AVAX`,
          },
        ],
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: ":snowman: Transaction",
            },
            url: getExplorerUrl({ network, hash: transactionHash }),
            action_id: "transaction-hash-link",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: ":bust_in_silhouette: User",
            },
            url: getExplorerUrl({ network, address: user }),
            action_id: "user-link",
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Node ID:* \`${nodeIDs[0]}\``,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Hardware Provider:* ${hardwareProviderName}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Subnet:* ${subnetName}`,
        },
      },
    ],
  };
};

export const SLACK_MINIPOOL_LAUNCHED_TEMPLATE = async ({
  network,
  transactionHash,
  nodeID,
  owner,
}: {
  network?: Network;
  owner: string;
  transactionHash: string;
  nodeID: string;
  hardwareProviderName: string;
}) => {
  const headerText =
    network === Network.FUJI
      ? ":female-construction-worker: :rocket: Minipool Launched (Testnet)"
      : ":rocket: Minipool Launched";
  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: headerText,
          emoji: true,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: ":snowman: Transaction",
            },
            url: getExplorerUrl({ network, hash: transactionHash }),
            action_id: "transaction-hash-link",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: ":bust_in_silhouette: Owner",
            },
            url: getExplorerUrl({ network, address: owner }),
            action_id: "owner-link",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: ":closed_umbrella: Validator",
            },
            url: getAvascanUrl({ network, nodeID }),
            action_id: "node-id-link",
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Node ID:* \`${nodeID}\``,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Hardware Provider:* Artifact`,
        },
      },
    ],
  };
};

export const SLACK_UNDERCOLLATERALIZED_TEMPLATE = async ({
  network,
  transactionHash,
  nodeID,
  owner,
}: {
  network?: Network;
  transactionHash: string;
  nodeID: string;
  owner: string;
}) => {
  const headerText = "⚠️ Minipool Kicked Out";
  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: headerText,
          emoji: true,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: ":snowman: Transaction",
            },
            url: getExplorerUrl({ network, hash: transactionHash }),
            action_id: "transaction-hash-link",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: ":bust_in_silhouette: Owner",
            },
            url: getExplorerUrl({ network, address: owner }),
            action_id: "owner-link",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: ":closed_umbrella: Validator",
            },
            url: getAvascanUrl({ network, nodeID }),
            action_id: "node-id-link",
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Node ID:* \`${nodeID}\``,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "This minipool was undercollateralized at the time of cycling and has been kicked out of the protocol.",
        },
      },
    ],
  };
};
