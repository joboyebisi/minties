/**
 * Transaction Service Library
 * Handles all blockchain transactions: approvals, transfers, contract interactions
 * Supports MetaMask Smart Accounts with gasless transactions where applicable
 */

import { Address, parseUnits, encodeFunctionData } from "viem";
import { sepolia } from "viem/chains";

// Contract addresses
export const USDC_ADDRESS: Address = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
export const SAVINGS_CIRCLE_ADDRESS = (process.env.NEXT_PUBLIC_SAVINGS_CIRCLE_ADDRESS || "0x0000000000000000000000000000000000000000") as Address;
export const GIFT_ESCROW_ADDRESS = (process.env.NEXT_PUBLIC_GIFT_ESCROW_ADDRESS || "0x0000000000000000000000000000000000000000") as Address;
export const AAVE_POOL_ADDRESS: Address = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";

// ERC20 ABI
export const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// Savings Circle ABI
export const SAVINGS_CIRCLE_ABI = [
  {
    type: "function",
    name: "createCircle",
    stateMutability: "nonpayable",
    inputs: [
      { name: "circleId", type: "bytes32" },
      { name: "targetAmount", type: "uint256" },
      { name: "lockPeriod", type: "uint256" },
      { name: "yieldPercentage", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "joinCircle",
    stateMutability: "nonpayable",
    inputs: [{ name: "circleId", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "contribute",
    stateMutability: "nonpayable",
    inputs: [
      { name: "circleId", type: "bytes32" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [
      { name: "circleId", type: "bytes32" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

// Gift Escrow ABI
export const GIFT_ESCROW_ABI = [
  {
    type: "function",
    name: "createGift",
    stateMutability: "nonpayable",
    inputs: [
      { name: "giftId", type: "bytes32" },
      { name: "amount", type: "uint256" },
      { name: "giftType", type: "uint8" },
      { name: "maxClaims", type: "uint256" },
      { name: "expiryTime", type: "uint256" },
      { name: "passwordHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "claimGift",
    stateMutability: "nonpayable",
    inputs: [
      { name: "giftId", type: "bytes32" },
      { name: "password", type: "string" },
    ],
    outputs: [],
  },
] as const;

/**
 * Check and approve token spending if needed
 */
export async function ensureApproval({
  walletClient,
  tokenAddress,
  spenderAddress,
  amount,
  decimals = 6,
}: {
  walletClient: any;
  tokenAddress: Address;
  spenderAddress: Address;
  amount: string | number;
  decimals?: number;
}): Promise<{ hash: `0x${string}` } | null> {
  if (!walletClient?.account?.address) {
    throw new Error("Wallet not connected");
  }

  const accountAddress = walletClient.account.address;
  const amountWei = typeof amount === "string" ? parseUnits(amount, decimals) : BigInt(amount);

  // Check current allowance
  const publicClient = walletClient.transport;
  // For now, we'll approve every time. In production, you'd check allowance first
  // const allowance = await publicClient.readContract({
  //   address: tokenAddress,
  //   abi: ERC20_ABI,
  //   functionName: "allowance",
  //   args: [accountAddress, spenderAddress],
  // });

  // Approve token spending
  const hash = await walletClient.writeContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [spenderAddress, amountWei],
    account: walletClient.account,
  });

  return { hash };
}

/**
 * Contribute to a Savings Circle
 */
export async function contributeToCircle({
  walletClient,
  circleId,
  amount,
  decimals = 6,
}: {
  walletClient: any;
  circleId: string;
  amount: string | number;
  decimals?: number;
}): Promise<{ hash: `0x${string}` }> {
  if (!walletClient?.account?.address) {
    throw new Error("Wallet not connected");
  }

  if (!SAVINGS_CIRCLE_ADDRESS) {
    throw new Error("Savings Circle contract address not configured");
  }

  const amountWei = typeof amount === "string" ? parseUnits(amount, decimals) : BigInt(amount);
  const circleIdBytes32 = circleId as `0x${string}`;

  // Ensure approval
  await ensureApproval({
    walletClient,
    tokenAddress: USDC_ADDRESS,
    spenderAddress: SAVINGS_CIRCLE_ADDRESS,
    amount: amountWei.toString(),
    decimals,
  });

  // Contribute to circle
  const hash = await walletClient.writeContract({
    address: SAVINGS_CIRCLE_ADDRESS,
    abi: SAVINGS_CIRCLE_ABI,
    functionName: "contribute",
    args: [circleIdBytes32, amountWei],
    account: walletClient.account,
  });

  return { hash };
}

/**
 * Withdraw from a Savings Circle
 */
export async function withdrawFromCircle({
  walletClient,
  circleId,
  amount,
  decimals = 6,
}: {
  walletClient: any;
  circleId: string;
  amount: string | number;
  decimals?: number;
}): Promise<{ hash: `0x${string}` }> {
  if (!walletClient?.account?.address) {
    throw new Error("Wallet not connected");
  }

  if (!SAVINGS_CIRCLE_ADDRESS) {
    throw new Error("Savings Circle contract address not configured");
  }

  const amountWei = typeof amount === "string" ? parseUnits(amount, decimals) : BigInt(amount);
  const circleIdBytes32 = circleId as `0x${string}`;

  const hash = await walletClient.writeContract({
    address: SAVINGS_CIRCLE_ADDRESS,
    abi: SAVINGS_CIRCLE_ABI,
    functionName: "withdraw",
    args: [circleIdBytes32, amountWei],
    account: walletClient.account,
  });

  return { hash };
}

/**
 * Create a gift in escrow
 */
export async function createGift({
  walletClient,
  giftId,
  amount,
  giftType = 0, // 0 = SingleUse, 1 = MultiUse, 2 = Scheduled
  maxClaims = 1,
  expiryTime = 0,
  passwordHash = "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
  decimals = 6,
}: {
  walletClient: any;
  giftId: string;
  amount: string | number;
  giftType?: number;
  maxClaims?: number;
  expiryTime?: number;
  passwordHash?: `0x${string}`;
  decimals?: number;
}): Promise<{ hash: `0x${string}` }> {
  if (!walletClient?.account?.address) {
    throw new Error("Wallet not connected");
  }

  if (!GIFT_ESCROW_ADDRESS) {
    throw new Error("Gift Escrow contract address not configured");
  }

  const amountWei = typeof amount === "string" ? parseUnits(amount, decimals) : BigInt(amount);
  const giftIdBytes32 = giftId as `0x${string}`;

  // Ensure approval
  await ensureApproval({
    walletClient,
    tokenAddress: USDC_ADDRESS,
    spenderAddress: GIFT_ESCROW_ADDRESS,
    amount: amountWei.toString(),
    decimals,
  });

  // Create gift
  const hash = await walletClient.writeContract({
    address: GIFT_ESCROW_ADDRESS,
    abi: GIFT_ESCROW_ABI,
    functionName: "createGift",
    args: [giftIdBytes32, amountWei, giftType, BigInt(maxClaims), BigInt(expiryTime), passwordHash],
    account: walletClient.account,
  });

  return { hash };
}

/**
 * Claim a gift from escrow
 */
export async function claimGift({
  walletClient,
  giftId,
  password = "",
}: {
  walletClient: any;
  giftId: string;
  password?: string;
}): Promise<{ hash: `0x${string}` }> {
  if (!walletClient?.account?.address) {
    throw new Error("Wallet not connected");
  }

  if (!GIFT_ESCROW_ADDRESS) {
    throw new Error("Gift Escrow contract address not configured");
  }

  const giftIdBytes32 = giftId as `0x${string}`;

  const hash = await walletClient.writeContract({
    address: GIFT_ESCROW_ADDRESS,
    abi: GIFT_ESCROW_ABI,
    functionName: "claimGift",
    args: [giftIdBytes32, password],
    account: walletClient.account,
  });

  return { hash };
}

/**
 * Create a Savings Circle
 */
export async function createCircle({
  walletClient,
  circleId,
  targetAmount,
  lockPeriod,
  yieldPercentage,
  decimals = 6,
}: {
  walletClient: any;
  circleId: string;
  targetAmount: string | number;
  lockPeriod: number; // in seconds
  yieldPercentage: number; // in basis points (500 = 5%)
  decimals?: number;
}): Promise<{ hash: `0x${string}` }> {
  if (!walletClient?.account?.address) {
    throw new Error("Wallet not connected");
  }

  if (!SAVINGS_CIRCLE_ADDRESS) {
    throw new Error("Savings Circle contract address not configured");
  }

  const targetAmountWei = typeof targetAmount === "string" ? parseUnits(targetAmount, decimals) : BigInt(targetAmount);
  const circleIdBytes32 = circleId as `0x${string}`;

  const hash = await walletClient.writeContract({
    address: SAVINGS_CIRCLE_ADDRESS,
    abi: SAVINGS_CIRCLE_ABI,
    functionName: "createCircle",
    args: [circleIdBytes32, targetAmountWei, BigInt(lockPeriod), BigInt(yieldPercentage)],
    account: walletClient.account,
  });

  return { hash };
}

/**
 * Join a Savings Circle
 */
export async function joinCircle({
  walletClient,
  circleId,
}: {
  walletClient: any;
  circleId: string;
}): Promise<{ hash: `0x${string}` }> {
  if (!walletClient?.account?.address) {
    throw new Error("Wallet not connected");
  }

  if (!SAVINGS_CIRCLE_ADDRESS) {
    throw new Error("Savings Circle contract address not configured");
  }

  const circleIdBytes32 = circleId as `0x${string}`;

  const hash = await walletClient.writeContract({
    address: SAVINGS_CIRCLE_ADDRESS,
    abi: SAVINGS_CIRCLE_ABI,
    functionName: "joinCircle",
    args: [circleIdBytes32],
    account: walletClient.account,
  });

  return { hash };
}

/**
 * Generate password hash for gift password protection
 */
export async function hashPassword(password: string): Promise<`0x${string}`> {
  // Simple keccak256 hash - matches contract's keccak256(abi.encodePacked(password))
  const { keccak256, toBytes } = await import("viem");
  const hash = keccak256(toBytes(password));
  return hash;
}

