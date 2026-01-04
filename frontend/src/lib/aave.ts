import { createPublicClient, http, getContract } from "viem";
import { Address, Hash } from "viem";

// Aave v3 Sepolia addresses (provided)
export const AAVE_POOL_ADDRESS: Address = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";
export const AAVE_ORACLE_ADDRESS: Address = "0xAc6D153b376e238F74d1c6Ec232e10dE3b0B8eE3";
export const USDC_ADDRESS: Address = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

// Minimal ABIs
const poolAbi = [
  {
    type: "function",
    name: "getReserveData",
    stateMutability: "view",
    inputs: [{ name: "asset", type: "address" }],
    outputs: [
      { name: "configuration", type: "uint256" },
      { name: "liquidityIndex", type: "uint128" },
      { name: "currentLiquidityRate", type: "uint128" }, // ray
      { name: "variableBorrowIndex", type: "uint128" },
      { name: "currentVariableBorrowRate", type: "uint128" },
      { name: "currentStableBorrowRate", type: "uint128" },
      { name: "lastUpdateTimestamp", type: "uint40" },
      { name: "id", type: "uint16" },
      { name: "aTokenAddress", type: "address" },
      { name: "stableDebtTokenAddress", type: "address" },
      { name: "variableDebtTokenAddress", type: "address" },
      { name: "interestRateStrategyAddress", type: "address" },
      { name: "unbacked", type: "uint128" },
      { name: "isolationModeTotalDebt", type: "uint128" },
    ],
  },
  {
    type: "function",
    name: "supply",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
      { name: "referralCode", type: "uint16" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "to", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
];

const erc20Abi = [
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
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
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
  }
];

const rayToApy = (ray: bigint) => {
  // ray = 1e27; apy = liquidityRate / 1e27
  const RAY = 10n ** 27n;
  const apy = Number(ray) / Number(RAY);
  return apy * 100; // %
};

export async function fetchAaveApy(rpcUrl?: string) {
  const client = createPublicClient({
    transport: http(rpcUrl || process.env.NEXT_PUBLIC_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com"),
  });
  const data = await client.readContract({
    address: AAVE_POOL_ADDRESS,
    abi: poolAbi,
    functionName: "getReserveData",
    args: [USDC_ADDRESS],
  });
  const liquidityRate = (data as any).currentLiquidityRate as bigint;
  return rayToApy(liquidityRate);
}

export async function supplyUsdc({
  walletClient,
  publicClient,
  amount,
  decimals = 6,
}: {
  walletClient: any;
  publicClient: any;
  amount: number;
  decimals?: number;
}) {
  if (!walletClient || !publicClient) {
    throw new Error("Wallet or Public client not available.");
  }

  if (!walletClient.account?.address) {
    throw new Error("Wallet account not found. Please reconnect.");
  }

  const parsed = BigInt(Math.round(amount * 10 ** decimals));
  const accountAddress = walletClient.account.address as Address;

  // 1. Check Balance First (Prevent Revert)
  const balance = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [accountAddress],
  }) as bigint;

  if (balance < parsed) {
    throw new Error(`Insufficient USDC Balance. You have ${Number(balance) / 10 ** decimals} USDC but tried to deposit ${amount} USDC.`);
  }

  // 2. Check current allowance
  const currentAllowance = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: [accountAddress, AAVE_POOL_ADDRESS],
  }) as bigint;

  let approveTx;

  // 3. Approve if needed
  if (currentAllowance < parsed) {
    console.log(`Current allowance (${currentAllowance}) < Required (${parsed}). Approving...`);
    approveTx = await walletClient.writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [AAVE_POOL_ADDRESS, parsed], // Use exact amount or max uint256
      account: walletClient.account,
    });

    console.log("Waiting for approval to be mined...", approveTx);
    await publicClient.waitForTransactionReceipt({ hash: approveTx });
    console.log("Approval confirmed.");
  } else {
    console.log("Allowance sufficient. Skipping approval.");
  }

  // 4. Supply to Aave
  console.log("Supplying to Aave contract...");
  const supplyTx = await walletClient.writeContract({
    address: AAVE_POOL_ADDRESS,
    abi: poolAbi,
    functionName: "supply",
    args: [USDC_ADDRESS, parsed, accountAddress, 0],
    account: walletClient.account,
  });

  return { approveTx, supplyTx };
}

export async function withdrawUsdc({
  walletClient,
  amount,
  decimals = 6,
}: {
  walletClient: any;
  amount: number;
  decimals?: number;
}) {
  if (!walletClient) {
    throw new Error("Wallet client not available. Please ensure your wallet is connected.");
  }

  if (!walletClient.account?.address) {
    throw new Error("Wallet account not found. Please reconnect your wallet.");
  }

  const parsed = BigInt(Math.round(amount * 10 ** decimals));
  const accountAddress = walletClient.account.address as Address;

  const tx = await walletClient.writeContract({
    address: AAVE_POOL_ADDRESS,
    abi: poolAbi,
    functionName: "withdraw",
    args: [USDC_ADDRESS, parsed, accountAddress],
    account: walletClient.account,
  });

  return tx as Hash;
}

