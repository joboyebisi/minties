// MetaMask Advanced Permissions (ERC-7715) Full Implementation
// Based on MetaMask Smart Accounts Kit documentation

import { Address, parseUnits, createWalletClient, custom, createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { erc7715ProviderActions } from '@metamask/smart-accounts-kit/actions';
import { createBundlerClient } from 'viem/account-abstraction';
import { erc7710BundlerActions } from '@metamask/smart-accounts-kit/actions';
import { toMetaMaskSmartAccount, Implementation } from '@metamask/smart-accounts-kit';
import { privateKeyToAccount } from 'viem/accounts';

// USDC address on Sepolia
export const USDC_ADDRESS: Address = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

// Create wallet client with Advanced Permissions support
export function createWalletClientWithPermissions() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not detected');
  }

  return createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
  }).extend(erc7715ProviderActions());
}

// Create public client
export function createPublicClientForChain() {
  return createPublicClient({
    chain: sepolia,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'),
  });
}

// Create bundler client with delegation support
export function createBundlerClientWithDelegation(publicClient: ReturnType<typeof createPublicClientForChain>) {
  const bundlerUrl = process.env.NEXT_PUBLIC_BUNDLER_URL || 'https://api.pimlico.io/v2/11155111/rpc';
  
  return createBundlerClient({
    client: publicClient,
    transport: http(bundlerUrl),
  }).extend(erc7710BundlerActions());
}

// Create session account (smart account for executing permissions)
export async function createSessionAccount(
  publicClient: ReturnType<typeof createPublicClientForChain>,
  ownerAddress: Address
) {
  // Create a Hybrid smart account
  return await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [ownerAddress, [], [], []],
    deploySalt: '0x',
    signer: {
      // This will be set by the wallet client when requesting permissions
      account: undefined as any,
    },
  });
}

// Request ERC-20 periodic transfer permission (for recurring payments)
export async function requestRecurringTransferPermission({
  walletClient,
  sessionAccountAddress,
  tokenAddress = USDC_ADDRESS,
  periodAmount,
  periodDuration, // seconds (e.g., 86400 for daily, 604800 for weekly, 2592000 for monthly)
  expiry, // Unix timestamp
  justification,
}: {
  walletClient: ReturnType<typeof createWalletClientWithPermissions>;
  sessionAccountAddress: Address;
  tokenAddress?: Address;
  periodAmount: string; // USDC amount as string (e.g., "10")
  periodDuration: number; // seconds
  expiry: number; // Unix timestamp
  justification?: string;
}) {
  const publicClient = createPublicClientForChain();
  const chainId = sepolia.id;

  // Convert amount to wei (USDC has 6 decimals)
  const amountWei = parseUnits(periodAmount, 6);

  const grantedPermissions = await walletClient.requestExecutionPermissions([
    {
      chainId,
      expiry,
      signer: {
        type: 'account',
        data: {
          address: sessionAccountAddress,
        },
      },
      permission: {
        type: 'erc20-token-periodic',
        data: {
          tokenAddress,
          periodAmount: amountWei,
          periodDuration,
          justification: justification || `Recurring transfer of ${periodAmount} USDC every ${periodDuration / 86400} day(s)`,
        },
      },
      isAdjustmentAllowed: true,
    },
  ]);

  return grantedPermissions[0];
}

// Request ERC-20 stream permission (for continuous streaming)
export async function requestStreamingTransferPermission({
  walletClient,
  sessionAccountAddress,
  tokenAddress = USDC_ADDRESS,
  amountPerSecond,
  initialAmount,
  maxAmount,
  startTime,
  expiry,
  justification,
}: {
  walletClient: ReturnType<typeof createWalletClientWithPermissions>;
  sessionAccountAddress: Address;
  tokenAddress?: Address;
  amountPerSecond: string; // USDC per second
  initialAmount: string; // Initial amount released
  maxAmount: string; // Maximum total amount
  startTime: number; // Unix timestamp
  expiry: number;
  justification?: string;
}) {
  const publicClient = createPublicClientForChain();
  const chainId = sepolia.id;

  const grantedPermissions = await walletClient.requestExecutionPermissions([
    {
      chainId,
      expiry,
      signer: {
        type: 'account',
        data: {
          address: sessionAccountAddress,
        },
      },
      permission: {
        type: 'erc20-token-stream',
        data: {
          tokenAddress,
          amountPerSecond: parseUnits(amountPerSecond, 6),
          initialAmount: parseUnits(initialAmount, 6),
          maxAmount: parseUnits(maxAmount, 6),
          startTime,
          justification: justification || `Streaming transfer of ${amountPerSecond} USDC per second`,
        },
      },
      isAdjustmentAllowed: true,
    },
  ]);

  return grantedPermissions[0];
}

// Redeem permission to execute a transfer
export async function redeemPermissionAndTransfer({
  bundlerClient,
  sessionAccount,
  permissionsContext,
  delegationManager,
  recipientAddress,
  amount,
  tokenAddress = USDC_ADDRESS,
}: {
  bundlerClient: ReturnType<typeof createBundlerClientWithDelegation>;
  sessionAccount: Awaited<ReturnType<typeof createSessionAccount>>;
  permissionsContext: any;
  delegationManager: Address;
  recipientAddress: Address;
  amount: string; // USDC amount as string
  tokenAddress?: Address;
}) {
  const publicClient = createPublicClientForChain();
  const amountWei = parseUnits(amount, 6);

  // Encode ERC-20 transfer call
  const transferData = `0xa9059cbb${recipientAddress.slice(2).padStart(64, '0')}${amountWei.toString(16).padStart(64, '0')}`;

  const userOperationHash = await bundlerClient.sendUserOperationWithDelegation({
    publicClient,
    account: sessionAccount,
    calls: [
      {
        to: tokenAddress,
        data: transferData as `0x${string}`,
        permissionsContext,
        delegationManager,
      },
    ],
    // Gas fees - these should be estimated properly in production
    maxFeePerGas: 1n,
    maxPriorityFeePerGas: 1n,
  });

  return userOperationHash;
}

// Helper: Calculate expiry timestamp (e.g., 30 days from now)
export function calculateExpiry(days: number): number {
  return Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;
}

// Helper: Calculate period duration in seconds
export const PERIOD_DURATIONS = {
  daily: 86400,
  weekly: 604800,
  monthly: 2592000,
  yearly: 31536000,
};

// Setup recurring transfer for Money Box
export async function setupMoneyBoxRecurringTransfer({
  walletClient,
  sessionAccountAddress,
  monthlyAmount,
  months,
}: {
  walletClient: ReturnType<typeof createWalletClientWithPermissions>;
  sessionAccountAddress: Address;
  monthlyAmount: string;
  months: number;
}) {
  const expiry = calculateExpiry(months * 30); // Approximate months to days

  return await requestRecurringTransferPermission({
    walletClient,
    sessionAccountAddress,
    periodAmount: monthlyAmount,
    periodDuration: PERIOD_DURATIONS.monthly,
    expiry,
    justification: `Monthly savings contribution of ${monthlyAmount} USDC for ${months} months`,
  });
}

// Setup recurring transfer for Savings Circle contribution
export async function setupCircleRecurringContribution({
  walletClient,
  sessionAccountAddress,
  weeklyAmount,
  weeks,
}: {
  walletClient: ReturnType<typeof createWalletClientWithPermissions>;
  sessionAccountAddress: Address;
  weeklyAmount: string;
  weeks: number;
}) {
  const expiry = calculateExpiry(weeks * 7);

  return await requestRecurringTransferPermission({
    walletClient,
    sessionAccountAddress,
    periodAmount: weeklyAmount,
    periodDuration: PERIOD_DURATIONS.weekly,
    expiry,
    justification: `Weekly contribution of ${weeklyAmount} USDC to savings circle for ${weeks} weeks`,
  });
}

// Setup recurring gift
export async function setupRecurringGift({
  walletClient,
  sessionAccountAddress,
  amount,
  frequency, // 'daily' | 'weekly' | 'monthly'
  duration, // number of periods
}: {
  walletClient: ReturnType<typeof createWalletClientWithPermissions>;
  sessionAccountAddress: Address;
  amount: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  duration: number;
}) {
  const periodDuration = PERIOD_DURATIONS[frequency];
  const expiry = calculateExpiry(duration * (periodDuration / 86400));

  return await requestRecurringTransferPermission({
    walletClient,
    sessionAccountAddress,
    periodAmount: amount,
    periodDuration,
    expiry,
    justification: `Recurring gift of ${amount} USDC ${frequency} for ${duration} periods`,
  });
}
