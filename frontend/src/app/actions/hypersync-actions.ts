"use server";

import { HypersyncClient } from "@envio-dev/hypersync-client";

// HyperSync Client Setup - Re-instantiated per request or cached globally in server scope
// Note: In serverless, global scope isn't guaranteed persistent, but acceptable for this client.
const hyperSyncClient = new HypersyncClient({
    url: process.env.HYPERSYNC_URL || "https://sepolia.hypersync.xyz",
    apiToken: process.env.HYPERSYNC_API_TOKEN || "233b693d-8971-47ba-b30d-c4ce34d61f86",
});

export async function getWalletHistoryAction(address: string) {
    try {
        const query = {
            fromBlock: 0,
            transactions: [
                { from: [address] },
                { to: [address] }
            ],
            fieldSelection: {
                transaction: ["block_number", "from", "to", "value", "input", "hash"] as any,
                // timestamp is usually on the block, not transaction directly in some schemas?
                // keeping it simple to unblock.
            }
        };

        const res = await hyperSyncClient.get(query);
        return res.data.transactions;
    } catch (e) {
        console.error("HyperSync Action Error:", e);
        return [];
    }
}
