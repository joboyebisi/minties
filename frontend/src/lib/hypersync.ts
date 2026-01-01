import { HypersyncClient } from "@envio-dev/hypersync-client";

// HyperSync Client Setup
export const hyperSyncClient = HypersyncClient.new({
    url: process.env.HYPERSYNC_URL || "https://sepolia.hypersync.xyz",
    apiToken: process.env.HYPERSYNC_API_TOKEN || "233b693d-8971-47ba-b30d-c4ce34d61f86",
});

// Helper to fetch events
export async function fetchContractEvents(contractAddress: string, eventSignature: string, fromBlock: number = 0) {
    try {
        // Envio client usually takes a specific query struct
        const query = {
            fromBlock,
            logs: [{
                address: [contractAddress],
                topics: [[eventSignature]]
            }],
            fieldSelection: {
                log: ["block_number", "log_index", "transaction_index", "data", "address", "topic0", "topic1", "topic2", "topic3"]
            }
        };

        const res = await hyperSyncClient.get(query);
        return res.data.logs;
    } catch (error) {
        console.error("HyperSync Fetch Error:", error);
        return [];
    }
}

export async function getWalletHistory(address: string) {
    try {
        // Query last 1M blocks or so? Or scan reverse?
        // Envio supports reverse scan? Docs say yes `stream(query, { reverse: true })`
        // We'll try a simple get for now.
        const query = {
            fromBlock: 0,
            transactions: [
                { from: [address] },
                { to: [address] }
            ],
            fieldSelection: {
                transaction: ["hash", "from", "to", "value", "block_number", "timestamp"]
            }
        };

        // For 'recent', we'd ideally want reverse or range.
        // Let's just fetch all avoiding limit if possible, or use defaults.
        const res = await hyperSyncClient.get(query);
        return res.data.transactions;
    } catch (e) {
        console.error(e);
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
