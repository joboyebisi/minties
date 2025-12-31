/**
 * MetaMask Smart Account Logic
 * Handles creation and management of Hybrid and Stateless 7702 accounts
 * Based on MetaMask Smart Accounts Kit
 */

import {
    Implementation,
    toMetaMaskSmartAccount,
    SmartAccountsEnvironment,
    getSmartAccountsEnvironment,
    // deploySmartAccountsEnvironment // Removed as not found
} from "@metamask/smart-accounts-kit";
import { createWalletClient, createPublicClient, http, custom, Address } from "viem";
import { sepolia } from "viem/chains";
import { createBundlerClient } from "viem/account-abstraction";
// import { User } from "./gamification"; // Commented out as not found

// Bundler URL (Pimlico or similar) should be in env vars
const BUNDLER_URL = process.env.NEXT_PUBLIC_BUNDLER_URL || 'https://api.pimlico.io/v2/11155111/rpc?apikey=public';

export type SmartAccountType = 'hybrid' | 'stateless';

// Create a public client
export const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
});

// Setup the Smart Account
export async function setupSmartAccount(type: SmartAccountType = 'hybrid') {
    if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not detected');
    }

    // Temporary client to get address
    const tempClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
    });

    const addresses = await tempClient.requestAddresses();
    const owner = addresses[0];

    // standard wallet client with account
    const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
        account: owner,
    });

    // Resolve environment for Sepolia
    let environment: SmartAccountsEnvironment;
    try {
        environment = getSmartAccountsEnvironment(sepolia.id);
    } catch (error) {
        console.warn("Environment not found, attempting to deploy/default...");
        throw error;
    }

    let smartAccount;

    if (type === 'hybrid') {
        // Create Hybrid Account (Owner + optional passkeys)
        smartAccount = await toMetaMaskSmartAccount({
            client: publicClient,
            implementation: Implementation.Hybrid,
            deployParams: [owner, [], [], []], // Owner, keyIds, x, y
            deploySalt: "0x0",
            signer: walletClient, // Pass the client directly as signer
        });
    } else {
        // Stateless 7702 (requires EIP-7702 support)
        smartAccount = await toMetaMaskSmartAccount({
            client: publicClient,
            implementation: Implementation.Stateless7702,
            address: owner, // Upgraded EOA address
            signer: walletClient,
        });
    }

    // Create Bundler Client
    const bundlerClient = createBundlerClient({
        client: publicClient,
        transport: http(BUNDLER_URL),
        paymaster: true, // Auto-use paymaster if available
        account: smartAccount,
        chain: sepolia,
    });

    return {
        smartAccount,
        bundlerClient,
        address: smartAccount.address,
        type,
        userAddress: owner
    };
}
