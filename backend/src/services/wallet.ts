import { ethers } from "ethers";

// In-memory storage for user wallets (in production, use a database)
const userWallets = new Map<string, any>();

export function getProvider() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
  return new ethers.JsonRpcProvider(rpcUrl);
}

export async function connectWallet(userId: string): Promise<string> {
  // In a real implementation, this would:
  // 1. Generate a connection link with delegation
  // 2. User connects MetaMask
  // 3. Create or retrieve smart account
  
  const baseUrl = process.env.FRONTEND_URL || "https://minties.app";
  return `${baseUrl}/connect?userId=${userId}`;
}

export async function getWalletForUser(userId: string): Promise<any> {
  // In production, this would fetch from database
  // For now, return a mock or create a new one
  if (!userWallets.has(userId)) {
    // Create a new smart account for the user
    // This is a simplified version - in production, you'd handle this differently
    throw new Error("Wallet not connected. User must connect via frontend.");
  }
  
  return userWallets.get(userId);
}

export async function getWalletAddress(userId: string): Promise<string | null> {
  try {
    const wallet = await getWalletForUser(userId);
    return wallet?.address || null;
  } catch {
    return null;
  }
}

export async function getBalance(userId: string): Promise<string | null> {
  try {
    const address = await getWalletAddress(userId);
    if (!address) return null;

    const provider = getProvider();
    const usdcAddress = process.env.USDC_ADDRESS!;
    const usdcAbi = ["function balanceOf(address) view returns (uint256)"];
    const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, provider);
    
    const balance = await usdcContract.balanceOf(address);
    return ethers.formatUnits(balance, 6); // USDC has 6 decimals
  } catch {
    return null;
  }
}

// Store wallet after user connects (called from frontend)
export function storeWallet(userId: string, wallet: any) {
  userWallets.set(userId, wallet);
}

