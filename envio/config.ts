import { defineConfig } from "@envio-dev/envio";

export default defineConfig({
  network: "sepolia",
  contracts: [
    {
      name: "GiftEscrow",
      address: process.env.GIFT_ESCROW_ADDRESS || "",
      startBlock: 0,
    },
    {
      name: "SavingsCircle",
      address: process.env.SAVINGS_CIRCLE_ADDRESS || "",
      startBlock: 0,
    },
  ],
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

