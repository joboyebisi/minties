// MetaMask Advanced Permissions (ERC-7715) Full Implementation
// Based on MetaMask Smart Accounts Kit documentation

import { Address, parseUnits, createWalletClient, custom, createPublicClient, http, encodeFunctionData, parseEther } from 'viem';
import { sepolia } from 'viem/chains';
import { createBundlerClient } from 'viem/account-abstraction';
import {
  erc7715ProviderActions,
  erc7710BundlerActions
} from "@metamask/smart-accounts-kit/actions";

// USDC address on Sepolia
export const USDC_ADDRESS: Address = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

// Create wallet client extended with permissions actions
export function createWalletClientWithPermissions() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not detected');
  }

  const client = createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
  }).extend(erc7715ProviderActions());

  return client;
}

// Request ERC-20 periodic transfer permission (for recurring payments)
export async function requestRecurringTransferPermission({
  walletClient,
  sessionAccountAddress,
  tokenAddress = USDC_ADDRESS,
  periodAmount,
  periodDuration,
  expiry,
  justification,
}: {
  walletClient: ReturnType<typeof createWalletClientWithPermissions>;
  sessionAccountAddress: Address;
  tokenAddress?: Address;
  periodAmount: string; // Human readable amount (e.g. "10")
  periodDuration: number; // Seconds
  expiry: number; // Timestamp seconds
  justification?: string;
}) {
  const chainId = sepolia.id;
  // USDC has 6 decimals
  const amountWei = parseUnits(periodAmount, 6);

  try {
    const grantedPermissions = await walletClient.requestExecutionPermissions([{
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
          justification: justification || `Recurring transfer of ${periodAmount} USDC`,
        },
      },
      isAdjustmentAllowed: true,
    }]);

    return grantedPermissions[0];
  } catch (error) {
    console.error("Failed to request permissions:", error);
    throw error;
  }
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
  bundlerClient: any; // Typed as ReturnType<typeof createBundlerClient> & erc7710BundlerActions
  sessionAccount: any;
  permissionsContext: any;
  delegationManager: Address;
  recipientAddress: Address;
  amount: string;
  tokenAddress?: Address;
}) {
  const amountWei = parseUnits(amount, 6);

  // Encode ERC-20 transfer call
  // We use encodeFunctionData for safety instead of raw hex
  const transferData = encodeFunctionData({
    abi: [{
      name: 'transfer',
      type: 'function',
      inputs: [{ name: 'recipient', type: 'address' }, { name: 'amount', type: 'uint256' }],
      outputs: [{ name: '', type: 'bool' }]
    }],
    args: [recipientAddress, amountWei]
  });

  try {
    const userOperationHash = await bundlerClient.sendUserOperationWithDelegation({
      account: sessionAccount,
      calls: [
        {
          to: tokenAddress,
          data: transferData,
          permissionsContext,
          delegationManager,
        },
      ],
      // Fee estimation should be handled by bundler ordinarily, 
      // but if explicit values needed:
      // maxFeePerGas: 1n,
      // maxPriorityFeePerGas: 1n,
    });

    return userOperationHash;
  } catch (error) {
    console.error("Failed to redeem permission:", error);
    throw error;
  }
}

// Helper: Calculate expiry timestamp
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

// --- Feature Specific Helpers ---

function asWalletClient(client: any): ReturnType<typeof createWalletClientWithPermissions> {
  return client as any;
}

export async function setupMoneyBoxRecurringTransfer({
  walletClient,
  sessionAccountAddress,
  monthlyAmount,
  frequency = 'monthly',
  duration
}: {
  walletClient: any;
  sessionAccountAddress: Address;
  monthlyAmount: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  duration: number;
}) {
  const durationDays = frequency === 'daily' ? 1 : frequency === 'weekly' ? 7 : 30;
  const expiry = calculateExpiry(duration * durationDays);

  return requestRecurringTransferPermission({
    walletClient: asWalletClient(walletClient),
    sessionAccountAddress,
    periodAmount: monthlyAmount,
    periodDuration: PERIOD_DURATIONS[frequency],
    expiry,
    justification: `MoneyBox auto-save: ${monthlyAmount} USDC/${frequency}`
  });
}

export async function setupRecurringGift({
  walletClient,
  sessionAccountAddress,
  amount,
  frequency,
  duration
}: {
  walletClient: any;
  sessionAccountAddress: Address;
  amount: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  duration: number;
}) {
  const durationDays = frequency === 'daily' ? 1 : frequency === 'weekly' ? 7 : 30;
  const expiry = calculateExpiry(duration * durationDays);

  return requestRecurringTransferPermission({
    walletClient: asWalletClient(walletClient),
    sessionAccountAddress,
    periodAmount: amount,
    periodDuration: PERIOD_DURATIONS[frequency],
    expiry,
    justification: `Recurring Gift: ${amount} USDC ${frequency}`
  });
}

export async function setupCircleRecurringContribution({
  walletClient,
  sessionAccountAddress,
  weeklyAmount,
  weeks
}: {
  walletClient: any;
  sessionAccountAddress: Address;
  weeklyAmount: string;
  weeks: number;
}) {
  const expiry = calculateExpiry(weeks * 7);
  return requestRecurringTransferPermission({
    walletClient: asWalletClient(walletClient),
    sessionAccountAddress,
    periodAmount: weeklyAmount,
    periodDuration: PERIOD_DURATIONS.weekly,
    expiry,
    justification: `Circle Contribution: ${weeklyAmount} USDC/week`
  });
}

export function createBundlerClientWithDelegation(params: any) {
  return createBundlerClient({
    ...params,
    transport: http('https://api.pimlico.io/v2/11155111/rpc?apikey=public'),
  });
}
