/**
 * Event Query Service - Abstraction Layer
 * 
 * This service provides a unified interface for querying blockchain events.
 * Supports both ethers.js (default) and Envio HyperSync (via API).
 * 
 * To use HyperSync:
 * 1. Set USE_HYPERSYNC=true in .env
 * 2. Set HYPERSYNC_API_TOKEN=your_token in .env
 */

import { ethers } from "ethers";
import { getProvider } from "./wallet.js";

const GIFT_ESCROW_ADDRESS = process.env.GIFT_ESCROW_ADDRESS || "";
const SAVINGS_CIRCLE_ADDRESS = process.env.SAVINGS_CIRCLE_ADDRESS || "";
const USE_HYPERSYNC = process.env.USE_HYPERSYNC === "true";
const HYPERSYNC_API_TOKEN = process.env.HYPERSYNC_API_TOKEN || "";
const HYPERSYNC_URL = process.env.HYPERSYNC_URL || "https://sepolia.hypersync.xyz";

// Event signatures
const GIFT_CREATED_TOPIC = ethers.id("GiftCreated(bytes32,address,uint256,uint8,uint256)");
const GIFT_CLAIMED_TOPIC = ethers.id("GiftClaimed(bytes32,address,uint256)");
const CIRCLE_CREATED_TOPIC = ethers.id("CircleCreated(bytes32,address,uint256,uint256,uint256)");
const CONTRIBUTION_MADE_TOPIC = ethers.id("ContributionMade(bytes32,address,uint256,uint256)");

/**
 * Make HyperSync API request
 */
async function hypersyncRequest(query: any): Promise<any> {
  if (!HYPERSYNC_API_TOKEN) {
    throw new Error("HYPERSYNC_API_TOKEN not set in environment variables");
  }

  const response = await fetch(`${HYPERSYNC_URL}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${HYPERSYNC_API_TOKEN}`,
    },
    body: JSON.stringify(query),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HyperSync API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Query GiftCreated events
 */
export async function queryGiftCreatedEvents(
  fromBlock?: number,
  toBlock?: number,
  creatorAddress?: string
): Promise<any[]> {
  if (USE_HYPERSYNC && HYPERSYNC_API_TOKEN) {
    return await queryGiftCreatedEventsHypersync(fromBlock, toBlock, creatorAddress);
  }
  
  return await queryGiftCreatedEventsEthers(fromBlock, toBlock, creatorAddress);
}

/**
 * Ethers.js implementation
 */
async function queryGiftCreatedEventsEthers(
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
    filter.topics?.push(ethers.zeroPadValue(creatorAddress, 32));
  }

  const logs = await provider.getLogs(filter);
  
  const iface = new ethers.Interface([
    "event GiftCreated(bytes32 indexed giftId, address indexed creator, uint256 amount, uint8 giftType, uint256 expiryTime)"
  ]);
  
  return logs.map((log) => {
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
 * HyperSync implementation using Envio API
 */
async function queryGiftCreatedEventsHypersync(
  fromBlock?: number,
  toBlock?: number,
  creatorAddress?: string
): Promise<any[]> {
  const topics: (string | null)[] = [GIFT_CREATED_TOPIC];
  
  // Creator is the second indexed parameter (index 1)
  if (creatorAddress) {
    topics.push(null); // First indexed param (giftId) - null means match any
    topics.push(ethers.zeroPadValue(creatorAddress, 32)); // Creator address
  }

  const query = {
    fromBlock: fromBlock || 0,
    toBlock: toBlock || "latest",
    logs: [
      {
        address: [GIFT_ESCROW_ADDRESS],
        topics: topics,
      },
    ],
    fieldSelection: {
      log: {
        address: true,
        topics: true,
        data: true,
        blockNumber: true,
        transactionHash: true,
      },
      transaction: {
        hash: true,
        from: true,
        to: true,
      },
      block: {
        number: true,
        timestamp: true,
      },
    },
  };
  
  const response = await hypersyncRequest(query);
  
  // Parse and format response similar to ethers.js version
  const iface = new ethers.Interface([
    "event GiftCreated(bytes32 indexed giftId, address indexed creator, uint256 amount, uint8 giftType, uint256 expiryTime)"
  ]);
  
  if (!response.data || !response.data.logs) {
    return [];
  }
  
  return response.data.logs.map((log: any) => {
    const parsed = iface.parseLog({
      topics: log.topics,
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
  if (USE_HYPERSYNC && HYPERSYNC_API_TOKEN) {
    return await queryGiftClaimedEventsHypersync(fromBlock, toBlock, claimerAddress, giftId);
  }
  
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
 * HyperSync implementation for GiftClaimed events
 */
async function queryGiftClaimedEventsHypersync(
  fromBlock?: number,
  toBlock?: number,
  claimerAddress?: string,
  giftId?: string
): Promise<any[]> {
  const topics: (string | null)[] = [GIFT_CLAIMED_TOPIC];
  
  if (giftId) {
    topics.push(ethers.id(giftId)); // First indexed param
  } else {
    topics.push(null);
  }
  
  if (claimerAddress) {
    topics.push(ethers.zeroPadValue(claimerAddress, 32)); // Second indexed param
  }

  const query = {
    fromBlock: fromBlock || 0,
    toBlock: toBlock || "latest",
    logs: [{ address: [GIFT_ESCROW_ADDRESS], topics }],
    fieldSelection: {
      log: { address: true, topics: true, data: true, blockNumber: true, transactionHash: true },
      transaction: { hash: true, from: true, to: true },
      block: { number: true, timestamp: true },
    },
  };
  
  const response = await hypersyncRequest(query);
  const iface = new ethers.Interface([
    "event GiftClaimed(bytes32 indexed giftId, address indexed claimer, uint256 amount)"
  ]);
  
  if (!response.data?.logs) return [];
  
  return response.data.logs.map((log: any) => {
    const parsed = iface.parseLog({ topics: log.topics, data: log.data });
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
  if (USE_HYPERSYNC && HYPERSYNC_API_TOKEN) {
    return await queryCircleCreatedEventsHypersync(fromBlock, toBlock, creatorAddress);
  }
  
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
 * HyperSync implementation for CircleCreated events
 */
async function queryCircleCreatedEventsHypersync(
  fromBlock?: number,
  toBlock?: number,
  creatorAddress?: string
): Promise<any[]> {
  const topics: (string | null)[] = [CIRCLE_CREATED_TOPIC];
  
  if (creatorAddress) {
    topics.push(null); // First indexed param (circleId)
    topics.push(ethers.zeroPadValue(creatorAddress, 32)); // Creator address
  }

  const query = {
    fromBlock: fromBlock || 0,
    toBlock: toBlock || "latest",
    logs: [{ address: [SAVINGS_CIRCLE_ADDRESS], topics }],
    fieldSelection: {
      log: { address: true, topics: true, data: true, blockNumber: true, transactionHash: true },
      transaction: { hash: true, from: true, to: true },
      block: { number: true, timestamp: true },
    },
  };
  
  const response = await hypersyncRequest(query);
  const iface = new ethers.Interface([
    "event CircleCreated(bytes32 indexed circleId, address indexed creator, uint256 targetAmount, uint256 lockPeriod, uint256 yieldPercentage)"
  ]);
  
  if (!response.data?.logs) return [];
  
  return response.data.logs.map((log: any) => {
    const parsed = iface.parseLog({ topics: log.topics, data: log.data });
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

export async function queryContributionEvents(
  circleId?: string,
  fromBlock?: number,
  toBlock?: number,
  memberAddress?: string
): Promise<any[]> {
  if (USE_HYPERSYNC && HYPERSYNC_API_TOKEN) {
    return await queryContributionEventsHypersync(circleId, fromBlock, toBlock, memberAddress);
  }
  
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
 * HyperSync implementation for ContributionMade events
 */
async function queryContributionEventsHypersync(
  circleId?: string,
  fromBlock?: number,
  toBlock?: number,
  memberAddress?: string
): Promise<any[]> {
  const topics: (string | null)[] = [CONTRIBUTION_MADE_TOPIC];
  
  if (circleId) {
    topics.push(ethers.id(circleId)); // First indexed param
  } else {
    topics.push(null);
  }
  
  if (memberAddress) {
    topics.push(ethers.zeroPadValue(memberAddress, 32)); // Second indexed param
  }

  const query = {
    fromBlock: fromBlock || 0,
    toBlock: toBlock || "latest",
    logs: [{ address: [SAVINGS_CIRCLE_ADDRESS], topics }],
    fieldSelection: {
      log: { address: true, topics: true, data: true, blockNumber: true, transactionHash: true },
      transaction: { hash: true, from: true, to: true },
      block: { number: true, timestamp: true },
    },
  };
  
  const response = await hypersyncRequest(query);
  const iface = new ethers.Interface([
    "event ContributionMade(bytes32 indexed circleId, address indexed member, uint256 amount, uint256 cycleNumber)"
  ]);
  
  if (!response.data?.logs) return [];
  
  return response.data.logs.map((log: any) => {
    const parsed = iface.parseLog({ topics: log.topics, data: log.data });
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

