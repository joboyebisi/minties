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

  // 3. Approve ALWAYS (Force Approval to rule out allowance issues)
  console.log(`Checking allowance: ${currentAllowance}. Forcing approval for safety...`);

  // Optional: If allowance is huge but supply fails, maybe reset it? 
  // For now, just approve exact amount needed or max.
  // We will approve parsed amount + a bit buffer? No, just parsed.

  approveTx = await walletClient.writeContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "approve",
    args: [AAVE_POOL_ADDRESS, parsed],
    account: walletClient.account,
  });

  console.log("Waiting for approval to be mined...", approveTx);
  await publicClient.waitForTransactionReceipt({ hash: approveTx });
  // 3b. Poll for allowance propagation (Critical for avoiding "Likely to fail" errors)
  console.log("Polling for allowance update...");
  let retries = 0;
  while (retries < 15) { // Try for 30 seconds
    const checkAllowance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "allowance",
      args: [accountAddress, AAVE_POOL_ADDRESS],
    }) as bigint;

    console.log(`Allowance check ${retries + 1}: ${checkAllowance.toString()} / ${parsed.toString()}`);

    if (checkAllowance >= parsed) {
      console.log("Allowance confirmed on-chain!");
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    retries++;
  }

  // 4. Supply to Aave
  console.log("Supplying to Aave contract...");

  // Try to estimate gas, if it fails, fallback to manual limit
  let gasLimit = BigInt(750000); // Increased safety fallback
  try {
    const estimate = await publicClient.estimateContractGas({
      address: AAVE_POOL_ADDRESS,
      abi: poolAbi,
      functionName: "supply",
      args: [USDC_ADDRESS, parsed, accountAddress, 0],
      account: walletClient.account,
    });
    console.log("Gas estimation succeeded:", estimate.toString());
    gasLimit = (estimate * 120n) / 100n; // +20% buffer
  } catch (e: any) {
    console.warn("Gas estimation failed (likely revert). Using manual limit.", e.message || e);
    // Log the specific revert reason if available
  }

  const supplyTx = await walletClient.writeContract({
    address: AAVE_POOL_ADDRESS,
    abi: poolAbi,
    functionName: "supply",
    args: [USDC_ADDRESS, parsed, accountAddress, 0],
    account: walletClient.account,
    gas: gasLimit,
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
