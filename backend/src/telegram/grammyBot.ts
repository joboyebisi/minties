import { Bot, Context, session } from "grammy";
import { GeminiAgent } from "./agent/GeminiAgent.js";
import { supabase } from "../lib/supabase.js";

// Session interface (if we want to store simple data)
interface SessionData {
    agent?: GeminiAgent;
    // Note: GeminiAgent object is not serializable for Redis/DB sessions usually.
    // For basic in-memory polling, this map approach works.
    // For production, we'd persist the *history* and recreate the Agent.
    // Let's use a simpler Map for the Agent instances for this Hackathon.
}

// In-memory store for Agents (ChatID -> Agent)
const agents = new Map<number, GeminiAgent>();

export function setupGrammyBot() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.error("❌ TELEGRAM_BOT_TOKEN not set!");
        return null;
    }

    const bot = new Bot(token);
    const frontendUrl = process.env.FRONTEND_URL || "https://minties.vercel.app";

    // --- Middleware ---
    bot.use(session({ initial: () => ({}) }));

    // --- Commands ---

    bot.command("start", async (ctx) => {
        // Reset Agent for this chat
        agents.set(ctx.chat.id, new GeminiAgent());

        await ctx.reply("🎁 *Welcome to Minties AI!* 🚀\nI am your intelligent financial assistant on Mantle.\n\nYou can talk to me naturally, e.g.:\n_\"How much money do I have in my savings?\"_\n_\"Show me available real estate assets\"_\n_\"Help me create a goal for a new laptop\"_", {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🚀 Open App", web_app: { url: frontendUrl } }],
                    [{ text: "💰 Money Box", web_app: { url: `${frontendUrl}/moneybox` } }]
                ]
            }
        });
    });

    bot.command("help", async (ctx) => {
        await ctx.reply("💬 *Minties Agent Commands*:\n/start - Restart the bot\n/clear - Clear conversation history\n\nOr just chat with me! I can fetch your profile, assets, and help you save.", { parse_mode: "Markdown" });
    });

    bot.command("clear", (ctx) => {
        agents.delete(ctx.chat.id);
        ctx.reply("🧹 Conversation history cleared.");
    });

    // --- AI Agent Handler ---
    bot.on("message:text", async (ctx) => {
        const chatId = ctx.chat.id;
        const text = ctx.message.text;

        // Get or Create Agent
        let agent = agents.get(chatId);
        if (!agent) {
            agent = new GeminiAgent();
            agents.set(chatId, agent);
        }

        // Show "typing..." status
        await ctx.replyWithChatAction("typing");

        try {
            // Process with Gemini
            const response = await agent.processMessage(text, ctx);
            await ctx.reply(response, { parse_mode: "Markdown" });
        } catch (e) {
            console.error("Bot Error:", e);
            await ctx.reply("⚠️ Sorry, I encountered an error processing your request.");
        }
    });

    // --- Handle Web App Data (Optional) ---
    bot.on("message:web_app_data", async (ctx) => {
        // Handle data sent back from the Mini App
        const data = ctx.message.web_app_data.data;
        await ctx.reply(`Received data from app: ${data}`);
    });

    // --- Start Bot ---
    // In Vercel/Serverless, we'd export webhook handler.
    // For Render/Polling:
    bot.start({
        onStart: (botInfo) => {
            console.log(`🤖 Minties Grammy Bot started as @${botInfo.username}`);
        },
    });

    return bot; // Return instance if needed for webhooks
}
