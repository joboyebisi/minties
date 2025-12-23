// MetaMask Advanced Permissions (ERC-7715) Full Implementation
// Based on MetaMask Smart Accounts Kit documentation

import { Address, parseUnits, createWalletClient, custom, createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { createBundlerClient } from 'viem/account-abstraction';

// USDC address on Sepolia
export const USDC_ADDRESS: Address = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

// Note: @metamask/smart-accounts-kit may need to be installed
// If the package is not available, these functions will need to be updated when it's published
// For now, we'll create type-safe stubs that can be replaced with actual implementations

// Type definitions for Advanced Permissions (based on MetaMask docs)
export interface PermissionRequest {
  chainId: number;
  expiry: number;
  signer: {
    type: 'account';
    data: {
      address: Address;
    };
  };
  permission: {
    type: 'erc20-token-periodic' | 'erc20-token-stream' | 'native-token-periodic' | 'native-token-stream';
    data: {
      tokenAddress?: Address;
      periodAmount?: bigint;
      periodDuration?: number;
      amountPerSecond?: bigint;
      initialAmount?: bigint;
      maxAmount?: bigint;
      startTime?: number;
      justification?: string;
    };
  };
  isAdjustmentAllowed: boolean;
}

export interface GrantedPermission {
  context: any;
  signerMeta: {
    delegationManager: Address;
  };
}

// Create wallet client (will be extended with erc7715ProviderActions when package is available)
export function createWalletClientWithPermissions() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not detected');
  }

  const client = createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
  });

  // TODO: When @metamask/smart-accounts-kit is installed, extend with:
  // .extend(erc7715ProviderActions())
  
  return client as any; // Type assertion for now
}

// Create public client
export function createPublicClientForChain() {
  return createPublicClient({
    chain: sepolia,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'),
  });
}

// Create bundler client (will be extended with erc7710BundlerActions when package is available)
export function createBundlerClientWithDelegation(publicClient: ReturnType<typeof createPublicClientForChain>) {
  const bundlerUrl = process.env.NEXT_PUBLIC_BUNDLER_URL || 'https://api.pimlico.io/v2/11155111/rpc';
  
  const client = createBundlerClient({
    client: publicClient,
    transport: http(bundlerUrl),
  });

  // TODO: When @metamask/smart-accounts-kit is installed, extend with:
  // .extend(erc7710BundlerActions())
  
  return client as any; // Type assertion for now
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
  periodAmount: string;
  periodDuration: number;
  expiry: number;
  justification?: string;
}) {
  const chainId = sepolia.id;
  const amountWei = parseUnits(periodAmount, 6);

  // TODO: Replace with actual implementation when @metamask/smart-accounts-kit is available
  // const grantedPermissions = await walletClient.requestExecutionPermissions([...])
  
  // For now, return a structured permission object
  const permission: PermissionRequest = {
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
  };

  // When package is available, uncomment:
  // if (walletClient.requestExecutionPermissions) {
  //   return await walletClient.requestExecutionPermissions([permission]);
  // }

  console.warn('MetaMask Smart Accounts Kit not fully configured. Permission structure created but not requested.');
  return { permission } as any;
}

// Request ERC-20 stream permission
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
  amountPerSecond: string;
  initialAmount: string;
  maxAmount: string;
  startTime: number;
  expiry: number;
  justification?: string;
}) {
  const chainId = sepolia.id;

  const permission: PermissionRequest = {
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
  };

  console.warn('MetaMask Smart Accounts Kit not fully configured. Permission structure created but not requested.');
  return { permission } as any;
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
  sessionAccount: any;
  permissionsContext: any;
  delegationManager: Address;
  recipientAddress: Address;
  amount: string;
  tokenAddress?: Address;
}) {
  const amountWei = parseUnits(amount, 6);

  // Encode ERC-20 transfer call
  const transferData = `0xa9059cbb${recipientAddress.slice(2).padStart(64, '0')}${amountWei.toString(16).padStart(64, '0')}`;

  // TODO: Replace with actual implementation when package is available
  // const userOperationHash = await bundlerClient.sendUserOperationWithDelegation({...})
  
  console.warn('MetaMask Smart Accounts Kit not fully configured. Transfer not executed.');
  return '0xplaceholder' as `0x${string}`;
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
  const expiry = calculateExpiry(months * 30);

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
  frequency,
  duration,
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
