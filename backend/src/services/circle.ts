import { ethers } from "ethers";
import { getProvider, getWalletForUser } from "./wallet.js";

const SAVINGS_CIRCLE_ADDRESS = process.env.SAVINGS_CIRCLE_ADDRESS!;
const USDC_ADDRESS = process.env.USDC_ADDRESS!;

// ABI for SavingsCircle contract
const SAVINGS_CIRCLE_ABI = [
  "function createCircle(bytes32 circleId, uint256 targetAmount, uint256 lockPeriod, uint256 yieldPercentage)",
  "function joinCircle(bytes32 circleId)",
  "function contribute(bytes32 circleId, uint256 amount)",
  "function getCircle(bytes32 circleId) view returns (address, uint256, uint256, uint256, uint256, uint256, uint256, uint256, bool, uint256)",
];

export async function createCircle(
  userId: string,
  targetAmount: number,
  lockPeriod?: number, // in seconds
  yieldPercentage?: number // in basis points (500 = 5%)
): Promise<string> {
  const wallet = await getWalletForUser(userId);
  if (!wallet) {
    throw new Error("Wallet not connected");
  }

  const provider = getProvider();
  const contract = new ethers.Contract(SAVINGS_CIRCLE_ADDRESS, SAVINGS_CIRCLE_ABI, wallet);
  
  const circleId = ethers.id(`${userId}_${Date.now()}`);
  const targetAmountWei = ethers.parseUnits(targetAmount.toString(), 6);
  const lockPeriodSeconds = lockPeriod || (7 * 24 * 60 * 60); // Default: 7 days in seconds
  const yieldBasisPoints = yieldPercentage || 500; // Default: 5% in basis points

  const tx = await contract.createCircle(circleId, targetAmountWei, lockPeriodSeconds, yieldBasisPoints);
  await tx.wait();

  return circleId;
}

export async function joinCircle(
  userId: string,
  circleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const wallet = await getWalletForUser(userId);
    if (!wallet) {
      return { success: false, error: "Wallet not connected" };
    }

    const provider = getProvider();
    const contract = new ethers.Contract(SAVINGS_CIRCLE_ADDRESS, SAVINGS_CIRCLE_ABI, wallet);
    
    const tx = await contract.joinCircle(circleId);
    await tx.wait();

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function contributeToCircle(
  userId: string,
  circleId: string,
  amount: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const wallet = await getWalletForUser(userId);
    if (!wallet) {
      return { success: false, error: "Wallet not connected" };
    }

    const provider = getProvider();
    const contract = new ethers.Contract(SAVINGS_CIRCLE_ADDRESS, SAVINGS_CIRCLE_ABI, wallet);
    
    // First approve USDC
    const usdcContract = new ethers.Contract(
      USDC_ADDRESS,
      ["function approve(address spender, uint256 amount)"],
      wallet
    );
    const amountWei = ethers.parseUnits(amount.toString(), 6);
    await usdcContract.approve(SAVINGS_CIRCLE_ADDRESS, amountWei);
    
    // Then contribute
    const tx = await contract.contribute(circleId, amountWei);
    const receipt = await tx.wait();

    return { success: true, txHash: receipt.hash };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCircleStatus(circleId: string) {
  // Try Envio first (faster, cheaper)
  try {
    const { getCircleDetails } = await import("./envio.js");
    const details = await getCircleDetails(circleId);
    if (details?.circle) {
      const circle = details.circle;
      return {
        creator: circle.creator,
        targetAmount: ethers.formatUnits(circle.targetAmount, 6),
        lockPeriod: Number(circle.lockPeriod),
        yieldPercentage: Number(circle.yieldPercentage) / 100,
        totalContributed: ethers.formatUnits(circle.totalContributed, 6),
        lockedAmount: ethers.formatUnits(circle.lockedAmount, 6),
        lockEndTime: Number(circle.lockEndTime),
        cycleNumber: Number(circle.cycleNumber),
        isActive: circle.isActive,
        memberCount: details.members.length,
        // Additional Envio data
        contributions: details.contributions,
        members: details.members,
      };
    }
  } catch (error) {
    console.warn('Envio query failed, falling back to contract call:', error);
  }

  // Fallback to direct contract call
  const provider = getProvider();
  const contract = new ethers.Contract(SAVINGS_CIRCLE_ADDRESS, SAVINGS_CIRCLE_ABI, provider);
  
  const [
    creator,
    targetAmount,
    lockPeriod,
    yieldPercentage,
    totalContributed,
    lockedAmount,
    lockEndTime,
    cycleNumber,
    isActive,
    memberCount,
  ] = await contract.getCircle(circleId);

  return {
    creator,
    targetAmount: ethers.formatUnits(targetAmount, 6),
    lockPeriod: Number(lockPeriod),
    yieldPercentage: Number(yieldPercentage) / 100,
    totalContributed: ethers.formatUnits(totalContributed, 6),
    lockedAmount: ethers.formatUnits(lockedAmount, 6),
    lockEndTime: Number(lockEndTime),
    cycleNumber: Number(cycleNumber),
    isActive,
    memberCount: Number(memberCount),
  };
}

