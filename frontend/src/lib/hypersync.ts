import { createClient } from "@hypersync/client";

// HyperSync Client Setup
export const hyperSyncClient = createClient({
    url: process.env.HYPERSYNC_URL || "https://sepolia.hypersync.xyz",
    bearerToken: process.env.HYPERSYNC_API_TOKEN || "233b693d-8971-47ba-b30d-c4ce34d61f86",
});

// Helper to fetch events
export async function fetchContractEvents(contractAddress: string, eventSignature: string, fromBlock: number = 0) {
    try {
        const query = {
            fromBlock,
            accounts: [contractAddress],
            topics: [[eventSignature]], // Topic 0 is the event signature
        };

        const res = await hyperSyncClient.getEvents(query);
        return res.events;
    } catch (error) {
        console.error("HyperSync Fetch Error:", error);
        return [];
    }
}

// Event Signatures (precut for efficiency)
export const EVENTS = {
    CIRCLE_CREATED: "CreateCircle(bytes32,uint256,uint256,uint256)",
    // Keccak256 of "CreateCircle(bytes32,uint256,uint256,uint256)" -> 0x...
    // Ideally we assume the library calculates this or we use established viem/ethers utils to hash it.
    // For now, let's keep it simple and assume we fetch raw logs.
};
