import { ethers } from "ethers";
import { getWalletForUser } from "./wallet.js";

export async function createGiftLink(
  userId: string,
  amount: number,
  type: "single" | "multi"
): Promise<string> {
  // TODO: replace with MetaMask Smart Accounts delegation when package is available.
  // For now, return a simple gift link with a generated giftId.
  const baseUrl = process.env.FRONTEND_URL || "https://minties.app";
  const giftId = `gift_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  // Include amount/type as query params for the frontend to display (non-secure; demo only)
  return `${baseUrl}/claim?giftId=${giftId}&amount=${amount}&type=${type}`;
}

export async function claimGift(
  userId: string,
  link: string
): Promise<{ success: boolean; amount?: string; txHash?: string; error?: string }> {
  try {
    // Placeholder: real implementation will redeem a delegation.
    // For now, return success stub.
    return { success: true, amount: "10", txHash: "0xplaceholder" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
