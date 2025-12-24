import { defineConfig } from "@envio-dev/envio";

export default defineConfig({
  network: "sepolia",
  contracts: [
    {
      name: "GiftEscrow",
      address: process.env.GIFT_ESCROW_ADDRESS || "",
      startBlock: process.env.GIFT_ESCROW_START_BLOCK ? parseInt(process.env.GIFT_ESCROW_START_BLOCK) : 0,
    },
    {
      name: "SavingsCircle",
      address: process.env.SAVINGS_CIRCLE_ADDRESS || "",
      startBlock: process.env.SAVINGS_CIRCLE_START_BLOCK ? parseInt(process.env.SAVINGS_CIRCLE_START_BLOCK) : 0,
    },
  ],
  handlers: {
    GiftEscrow: {
      GiftCreated: "./handlers/GiftEscrow.ts:handleGiftCreated",
      GiftClaimed: "./handlers/GiftEscrow.ts:handleGiftClaimed",
      GiftCancelled: "./handlers/GiftEscrow.ts:handleGiftCancelled",
      GiftExpired: "./handlers/GiftEscrow.ts:handleGiftExpired",
    },
    SavingsCircle: {
      CircleCreated: "./handlers/SavingsCircle.ts:handleCircleCreated",
      MemberJoined: "./handlers/SavingsCircle.ts:handleMemberJoined",
      ContributionMade: "./handlers/SavingsCircle.ts:handleContributionMade",
      FundsLocked: "./handlers/SavingsCircle.ts:handleFundsLocked",
      FundsUnlocked: "./handlers/SavingsCircle.ts:handleFundsUnlocked",
      Withdrawal: "./handlers/SavingsCircle.ts:handleWithdrawal",
    },
  },
  schema: {
    Gift: {
      id: "string",
      creator: "string",
      amount: "bigint",
      remainingAmount: "bigint",
      giftType: "string",
      maxClaims: "int",
      currentClaims: "int",
      expiryTime: "bigint",
      isActive: "boolean",
      createdAt: "datetime",
    },
    GiftClaim: {
      id: "string",
      giftId: "string",
      claimer: "string",
      amount: "bigint",
      timestamp: "datetime",
      txHash: "string",
    },
    SavingsCircle: {
      id: "string",
      creator: "string",
      targetAmount: "bigint",
      lockPeriod: "bigint",
      yieldPercentage: "int",
      totalContributed: "bigint",
      lockedAmount: "bigint",
      lockStartTime: "bigint",
      lockEndTime: "bigint",
      cycleNumber: "int",
      isActive: "boolean",
      createdAt: "datetime",
    },
    Contribution: {
      id: "string",
      circleId: "string",
      member: "string",
      amount: "bigint",
      cycleNumber: "int",
      timestamp: "datetime",
      txHash: "string",
    },
  },
});

