/**
 * Direct Event Query Service
 * 
 * Queries blockchain events directly using ethers.js
 * No indexer needed - simpler and works immediately
 * 
 * NOTE: This file is kept for backward compatibility.
 * New code should use eventQuery.ts which has abstraction for HyperSync migration.
 */

import { ethers } from "ethers";
import { getProvider } from "./wallet.js";

const GIFT_ESCROW_ADDRESS = process.env.GIFT_ESCROW_ADDRESS || "";
const SAVINGS_CIRCLE_ADDRESS = process.env.SAVINGS_CIRCLE_ADDRESS || "";

// Event signatures (keccak256 of event signature)
const GIFT_CREATED_TOPIC = ethers.id("GiftCreated(bytes32,address,uint256,uint8,uint256)");
const GIFT_CLAIMED_TOPIC = ethers.id("GiftClaimed(bytes32,address,uint256)");
const CIRCLE_CREATED_TOPIC = ethers.id("CircleCreated(bytes32,address,uint256,uint256,uint256)");
const CONTRIBUTION_MADE_TOPIC = ethers.id("ContributionMade(bytes32,address,uint256,uint256)");

/**
 * Query GiftCreated events
 */
export async function queryGiftCreatedEvents(
  fromBlock?: number,
  toBlock?: number,
  creatorAddress?: string
): Promise<any[]> {
  const provider = getProvider();
  
  const filter: ethers.Filter = {
    address: GIFT_ESCROW_ADDRESS,
    topics: [GIFT_CREATED_TOPIC],
    fromBlock: fromBlock || 0,
    toBlock: toBlock || "latest",
  };

  if (creatorAddress) {
    // Creator is the second indexed parameter
    filter.topics?.push(ethers.zeroPadValue(creatorAddress, 32));
  }

  const logs = await provider.getLogs(filter);
  
  // Parse events
  return logs.map((log) => {
    const iface = new ethers.Interface([
      "event GiftCreated(bytes32 indexed giftId, address indexed creator, uint256 amount, uint8 giftType, uint256 expiryTime)"
    ]);
    const parsed = iface.parseLog({
      topics: log.topics as string[],
      data: log.data,
    });
    
    return {
      giftId: parsed?.args[0],
      creator: parsed?.args[1],
      amount: parsed?.args[2],
      giftType: parsed?.args[3],
      expiryTime: parsed?.args[4],
      blockNumber: log.blockNumber,
      txHash: log.transactionHash,
    };
  });
}

/**
 * Query GiftClaimed events
 */
export async function queryGiftClaimedEvents(
  fromBlock?: number,
  toBlock?: number,
  claimerAddress?: string,
  giftId?: string
): Promise<any[]> {
  const provider = getProvider();
  
  const filter: ethers.Filter = {
    address: GIFT_ESCROW_ADDRESS,
    topics: [GIFT_CLAIMED_TOPIC],
    fromBlock: fromBlock || 0,
    toBlock: toBlock || "latest",
  };

  if (giftId) {
    filter.topics?.push(ethers.id(giftId));
  }
  if (claimerAddress) {
    filter.topics?.push(ethers.zeroPadValue(claimerAddress, 32));
  }

  const logs = await provider.getLogs(filter);
  
  const iface = new ethers.Interface([
    "event GiftClaimed(bytes32 indexed giftId, address indexed claimer, uint256 amount)"
  ]);
  
  return logs.map((log) => {
    const parsed = iface.parseLog({
      topics: log.topics as string[],
      data: log.data,
    });
    
    return {
      giftId: parsed?.args[0],
      claimer: parsed?.args[1],
      amount: parsed?.args[2],
      blockNumber: log.blockNumber,
      txHash: log.transactionHash,
    };
  });
}

/**
 * Query CircleCreated events
 */
export async function queryCircleCreatedEvents(
  fromBlock?: number,
  toBlock?: number,
  creatorAddress?: string
): Promise<any[]> {
  const provider = getProvider();
  
  const filter: ethers.Filter = {
    address: SAVINGS_CIRCLE_ADDRESS,
    topics: [CIRCLE_CREATED_TOPIC],
    fromBlock: fromBlock || 0,
    toBlock: toBlock || "latest",
  };

  if (creatorAddress) {
    filter.topics?.push(ethers.zeroPadValue(creatorAddress, 32));
  }

  const logs = await provider.getLogs(filter);
  
  const iface = new ethers.Interface([
    "event CircleCreated(bytes32 indexed circleId, address indexed creator, uint256 targetAmount, uint256 lockPeriod, uint256 yieldPercentage)"
  ]);
  
  return logs.map((log) => {
    const parsed = iface.parseLog({
      topics: log.topics as string[],
      data: log.data,
    });
    
    return {
      circleId: parsed?.args[0],
      creator: parsed?.args[1],
      targetAmount: parsed?.args[2],
      lockPeriod: parsed?.args[3],
      yieldPercentage: parsed?.args[4],
      blockNumber: log.blockNumber,
      txHash: log.transactionHash,
    };
  });
}

/**
 * Query ContributionMade events
 */
export async function queryContributionEvents(
  circleId?: string,
  fromBlock?: number,
  toBlock?: number,
  memberAddress?: string
): Promise<any[]> {
  const provider = getProvider();
  
  const filter: ethers.Filter = {
    address: SAVINGS_CIRCLE_ADDRESS,
    topics: [CONTRIBUTION_MADE_TOPIC],
    fromBlock: fromBlock || 0,
    toBlock: toBlock || "latest",
  };

  if (circleId) {
    filter.topics?.push(ethers.id(circleId));
  }
  if (memberAddress) {
    filter.topics?.push(ethers.zeroPadValue(memberAddress, 32));
  }

  const logs = await provider.getLogs(filter);
  
  const iface = new ethers.Interface([
    "event ContributionMade(bytes32 indexed circleId, address indexed member, uint256 amount, uint256 cycleNumber)"
  ]);
  
  return logs.map((log) => {
    const parsed = iface.parseLog({
      topics: log.topics as string[],
      data: log.data,
    });
    
    return {
      circleId: parsed?.args[0],
      member: parsed?.args[1],
      amount: parsed?.args[2],
      cycleNumber: parsed?.args[3],
      blockNumber: log.blockNumber,
      txHash: log.transactionHash,
    };
  });
}

/**
 * Get user's complete activity
 */
export async function getUserActivity(userAddress: string): Promise<{
  giftsCreated: any[];
  giftsClaimed: any[];
  circlesCreated: any[];
  contributions: any[];
}> {
  const [giftsCreated, giftsClaimed, circlesCreated, contributions] = await Promise.all([
    queryGiftCreatedEvents(undefined, undefined, userAddress),
    queryGiftClaimedEvents(undefined, undefined, userAddress),
    queryCircleCreatedEvents(undefined, undefined, userAddress),
    queryContributionEvents(undefined, undefined, undefined, userAddress),
  ]);

  return {
    giftsCreated,
    giftsClaimed,
    circlesCreated,
    contributions,
  };
}

