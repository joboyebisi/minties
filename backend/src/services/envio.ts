/**
 * Envio Indexer Service
 * 
 * This service provides functions to query indexed blockchain events
 * from Envio indexer instead of making direct contract calls.
 * 
 * Note: Replace ENVIO_API_URL with your actual Envio GraphQL endpoint
 * Get this from your Envio dashboard after deploying the indexer
 */

const ENVIO_API_URL = process.env.ENVIO_API_URL || '';
const ENVIO_API_KEY = process.env.ENVIO_API_KEY || '';

interface EnvioQueryResult<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

/**
 * Execute a GraphQL query against Envio indexer
 */
async function queryEnvio<T>(query: string, variables?: Record<string, any>): Promise<T | null> {
  if (!ENVIO_API_URL) {
    console.warn('Envio API URL not configured. Falling back to contract calls.');
    return null;
  }

  try {
    const response = await fetch(ENVIO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(ENVIO_API_KEY && { 'Authorization': `Bearer ${ENVIO_API_KEY}` }),
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      console.error('Envio query failed with status:', response.status);
      return null;
    }

    // Type assertion: response.json() returns Promise<any> which needs to be cast
    const result = (await response.json()) as EnvioQueryResult<T>;

    if (result.errors) {
      console.error('Envio query errors:', result.errors);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Envio query failed:', error);
    return null;
  }
}

/**
 * Get all gifts created by a user
 */
export async function getUserGifts(creatorAddress: string): Promise<any[]> {
  const query = `
    query GetUserGifts($creator: String!) {
      gifts(where: { creator: $creator }, orderBy: createdAt, orderDirection: desc) {
        id
        creator
        amount
        remainingAmount
        giftType
        maxClaims
        currentClaims
        expiryTime
        isActive
        createdAt
      }
    }
  `;

  const result = await queryEnvio<{ gifts: any[] }>(query, { creator: creatorAddress.toLowerCase() });
  return result?.gifts || [];
}

/**
 * Get all gifts claimed by a user
 */
export async function getUserGiftClaims(claimerAddress: string): Promise<any[]> {
  const query = `
    query GetUserGiftClaims($claimer: String!) {
      giftClaims(where: { claimer: $claimer }, orderBy: timestamp, orderDirection: desc) {
        id
        giftId
        claimer
        amount
        timestamp
        txHash
      }
    }
  `;

  const result = await queryEnvio<{ giftClaims: any[] }>(query, { claimer: claimerAddress.toLowerCase() });
  return result?.giftClaims || [];
}

/**
 * Get gift details and claim history
 */
export async function getGiftDetails(giftId: string): Promise<{
  gift: any;
  claims: any[];
} | null> {
  const query = `
    query GetGiftDetails($giftId: String!) {
      gift(id: $giftId) {
        id
        creator
        amount
        remainingAmount
        giftType
        maxClaims
        currentClaims
        expiryTime
        isActive
        createdAt
      }
      giftClaims(where: { giftId: $giftId }, orderBy: timestamp, orderDirection: desc) {
        id
        claimer
        amount
        timestamp
        txHash
      }
    }
  `;

  const result = await queryEnvio<{ gift: any; giftClaims: any[] }>(query, { giftId });
  if (!result) return null;

  return {
    gift: result.gift,
    claims: result.giftClaims || [],
  };
}

/**
 * Get all contributions to a circle
 */
export async function getCircleContributions(circleId: string): Promise<any[]> {
  const query = `
    query GetCircleContributions($circleId: String!) {
      contributions(where: { circleId: $circleId }, orderBy: timestamp, orderDirection: desc) {
        id
        member
        amount
        cycleNumber
        timestamp
        txHash
      }
    }
  `;

  const result = await queryEnvio<{ contributions: any[] }>(query, { circleId });
  return result?.contributions || [];
}

/**
 * Get circle details with latest events
 */
export async function getCircleDetails(circleId: string): Promise<{
  circle: any;
  contributions: any[];
  members: string[];
} | null> {
  const query = `
    query GetCircleDetails($circleId: String!) {
      savingsCircle(id: $circleId) {
        id
        creator
        targetAmount
        lockPeriod
        yieldPercentage
        totalContributed
        lockedAmount
        lockStartTime
        lockEndTime
        cycleNumber
        isActive
        createdAt
      }
      contributions(where: { circleId: $circleId }, orderBy: timestamp, orderDirection: desc, first: 50) {
        id
        member
        amount
        cycleNumber
        timestamp
      }
    }
  `;

  const result = await queryEnvio<{ savingsCircle: any; contributions: any[] }>(query, { circleId });
  if (!result || !result.savingsCircle) return null;

  // Extract unique members from contributions
  const members = Array.from(new Set(result.contributions.map((c: any) => c.member)));

  return {
    circle: result.savingsCircle,
    contributions: result.contributions || [],
    members,
  };
}

/**
 * Get user's complete activity across all contracts
 */
export async function getUserActivity(userAddress: string): Promise<{
  giftsCreated: any[];
  giftsClaimed: any[];
  circlesCreated: any[];
  contributions: any[];
} | null> {
  const query = `
    query GetUserActivity($user: String!) {
      giftsCreated: gifts(where: { creator: $user }, orderBy: createdAt, orderDirection: desc) {
        id
        amount
        giftType
        isActive
        createdAt
      }
      giftsClaimed: giftClaims(where: { claimer: $user }, orderBy: timestamp, orderDirection: desc) {
        id
        giftId
        amount
        timestamp
      }
      circlesCreated: savingsCircles(where: { creator: $user }, orderBy: createdAt, orderDirection: desc) {
        id
        targetAmount
        totalContributed
        isActive
        createdAt
      }
      contributions: contributions(where: { member: $user }, orderBy: timestamp, orderDirection: desc) {
        id
        circleId
        amount
        cycleNumber
        timestamp
      }
    }
  `;

  const result = await queryEnvio<{
    giftsCreated: any[];
    giftsClaimed: any[];
    circlesCreated: any[];
    contributions: any[];
  }>(query, { user: userAddress.toLowerCase() });

  return result;
}

/**
 * Get platform-wide statistics
 */
export async function getPlatformStats(): Promise<{
  totalGifts: number;
  totalGiftsValue: bigint;
  totalCircles: number;
  totalContributions: number;
  totalContributed: bigint;
} | null> {
  const query = `
    query GetPlatformStats {
      totalGifts: gifts {
        id
        amount
      }
      totalCircles: savingsCircles {
        id
      }
      totalContributions: contributions {
        id
        amount
      }
    }
  `;

  const result = await queryEnvio<{
    totalGifts: Array<{ id: string; amount: string }>;
    totalCircles: Array<{ id: string }>;
    totalContributions: Array<{ id: string; amount: string }>;
  }>(query);

  if (!result) return null;

  const totalGiftsValue = result.totalGifts.reduce(
    (sum, gift) => sum + BigInt(gift.amount || '0'),
    BigInt(0)
  );

  const totalContributed = result.totalContributions.reduce(
    (sum, contrib) => sum + BigInt(contrib.amount || '0'),
    BigInt(0)
  );

  return {
    totalGifts: result.totalGifts.length,
    totalGiftsValue,
    totalCircles: result.totalCircles.length,
    totalContributions: result.totalContributions.length,
    totalContributed,
  };
}

/**
 * Get recent activity feed (all events)
 */
export async function getRecentActivity(limit: number = 20): Promise<any[]> {
  const query = `
    query GetRecentActivity($limit: Int!) {
      recentGifts: gifts(orderBy: createdAt, orderDirection: desc, first: $limit) {
        id
        creator
        amount
        giftType
        createdAt
        type: "gift_created"
      }
      recentClaims: giftClaims(orderBy: timestamp, orderDirection: desc, first: $limit) {
        id
        giftId
        claimer
        amount
        timestamp
        type: "gift_claimed"
      }
      recentContributions: contributions(orderBy: timestamp, orderDirection: desc, first: $limit) {
        id
        circleId
        member
        amount
        timestamp
        type: "contribution"
      }
    }
  `;

  const result = await queryEnvio<{
    recentGifts: any[];
    recentClaims: any[];
    recentContributions: any[];
  }>(query, { limit });

  if (!result) return [];

  // Combine and sort by timestamp
  const activities = [
    ...result.recentGifts.map((g: any) => ({ ...g, timestamp: g.createdAt })),
    ...result.recentClaims.map((c: any) => ({ ...c, timestamp: c.timestamp })),
    ...result.recentContributions.map((c: any) => ({ ...c, timestamp: c.timestamp })),
  ].sort((a, b) => Number(b.timestamp) - Number(a.timestamp)).slice(0, limit);

  return activities;
}

/**
 * Check if a gift has been claimed
 */
export async function isGiftClaimed(giftId: string, claimerAddress?: string): Promise<boolean> {
  const query = claimerAddress
    ? `
      query CheckGiftClaimed($giftId: String!, $claimer: String!) {
        giftClaims(where: { giftId: $giftId, claimer: $claimer }) {
          id
        }
      }
    `
    : `
      query CheckGiftClaimed($giftId: String!) {
        giftClaims(where: { giftId: $giftId }) {
          id
        }
      }
    `;

  const variables = claimerAddress
    ? { giftId, claimer: claimerAddress.toLowerCase() }
    : { giftId };

  const result = await queryEnvio<{ giftClaims: any[] }>(query, variables);
  return (result?.giftClaims?.length || 0) > 0;
}

/**
 * Get circle members with their contribution stats
 */
export async function getCircleMembers(circleId: string): Promise<Array<{
  address: string;
  totalContributed: bigint;
  contributionCount: number;
  lastContribution: number;
}>> {
  const contributions = await getCircleContributions(circleId);

  // Group by member
  const memberMap = new Map<string, { total: bigint; count: number; lastTime: number }>();

  for (const contrib of contributions) {
    const member = contrib.member.toLowerCase();
    const amount = BigInt(contrib.amount || '0');
    const timestamp = Number(contrib.timestamp || 0);

    if (!memberMap.has(member)) {
      memberMap.set(member, { total: BigInt(0), count: 0, lastTime: 0 });
    }

    const stats = memberMap.get(member)!;
    stats.total += amount;
    stats.count += 1;
    stats.lastTime = Math.max(stats.lastTime, timestamp);
  }

  return Array.from(memberMap.entries()).map(([address, stats]) => ({
    address,
    totalContributed: stats.total,
    contributionCount: stats.count,
    lastContribution: stats.lastTime,
  }));
}

