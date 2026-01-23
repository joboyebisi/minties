import { supabase } from "../../lib/supabase";

export const tools = [
    {
        name: "get_user_profile",
        description: "Get the user's profile, points, and badges.",
        parameters: {
            type: "object",
            properties: {
                telegramId: { type: "number", description: "The Telegram User ID" }
            },
            required: ["telegramId"]
        }
    },
    {
        name: "get_moneyboxes",
        description: "List the user's current Money Box savings goals.",
        parameters: {
            type: "object",
            properties: {
                walletAddress: { type: "string", description: "The user's wallet address" }
            },
            required: ["walletAddress"]
        }
    },
    {
        name: "get_available_assets",
        description: "List available Real Estate assets for investment/savings.",
        parameters: {
            type: "object",
            properties: {},
        }
    },
    {
        name: "create_moneybox_link",
        description: "Generate a link to create a new Money Box with specific parameters.",
        parameters: {
            type: "object",
            properties: {
                title: { type: "string" },
                amount: { type: "number" },
                autoSave: { type: "boolean" }
            },
            required: ["title", "amount"]
        }
    }
];

export async function executeTool(name: string, args: any) {
    try {
        switch (name) {
            case "get_user_profile":
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('telegram_user_id', args.telegramId)
                    .single();
                return profile ? JSON.stringify(profile) : "Profile not found. Please connect your wallet in the App.";

            case "get_moneyboxes":
                const { data: boxes } = await supabase
                    .from('money_boxes')
                    .select('*')
                    .eq('owner', args.walletAddress);

                if (!boxes || boxes.length === 0) return "No Money Boxes found.";
                return JSON.stringify(boxes.map(b => `${b.title}: ${b.current_amount}/${b.target_amount} USDC`));

            case "get_available_assets", "get_assets": // Handle aliases
                // Mock or fetch from DB if we had an assets table (currently hardcoded in frontend)
                // Let's return a static list for the hackathon MVP matching the frontend
                return JSON.stringify([
                    { name: "Mantle City Center", apy: "12%", type: "Real Estate", price: "50 USDC/share" },
                    { name: "Seaside Villa", apy: "8.5%", type: "Real Estate", price: "100 USDC/share" },
                    { name: "Urban Loft", apy: "10%", type: "Real Estate", price: "25 USDC/share" }
                ]);

            case "create_moneybox_link":
                const params = new URLSearchParams({
                    title: args.title,
                    amount: args.amount.toString(),
                    auto: args.autoSave ? "true" : "false"
                });
                const url = `${process.env.FRONTEND_URL}/moneybox/create?${params.toString()}`;
                return `Click here to create your Money Box: ${url}`;

            default:
                return `Tool ${name} not implemented.`;
        }
    } catch (err: any) {
        return `Error executing tool ${name}: ${err.message}`;
    }
}
