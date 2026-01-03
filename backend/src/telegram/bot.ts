import TelegramBot from "node-telegram-bot-api";
import { handleGiftCommands } from "./handlers/gift.js";
import { handleCircleCommands } from "./handlers/circle.js";
import { handleWalletCommands } from "./handlers/wallet.js";
import { handleInviteCommands } from "./handlers/invite.js";
import { supabase } from "../lib/supabase.js";

export function setupTelegramBot(bot: TelegramBot) {
  // Start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // Send welcome message with Rich Menu
    await bot.sendMessage(chatId, "🎁 *Welcome to Minties!*", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚀 Open Minties App",
              web_app: { url: frontendUrl },
            },
          ],
          [
            {
              text: "💰 My Moneybox",
              web_app: { url: `${frontendUrl}/moneybox` },
            },
            {
              text: "🎁 Send Gift",
              web_app: { url: `${frontendUrl}/gift/send` },
            }
          ],
          [
            { text: "👥 Join Circle", callback_data: "join_circle_help" },
            { text: "❓ Help", callback_data: "help" }
          ]
        ],
      },
    });
  });

  // Web App command
  bot.onText(/\/webapp/, async (msg) => {
    const chatId = msg.chat.id;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    await bot.sendMessage(chatId, "📱 *Minties Mini App*", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚀 Launch App",
              web_app: { url: frontendUrl },
            },
          ],
        ],
      },
    });
  });

  // Help command
  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    await sendHelpMessage(bot, chatId);
  });

  // Callback Query Handler
  bot.on("callback_query", async (query) => {
    const chatId = query.message?.chat.id;
    if (!chatId) return;

    if (query.data === "help") {
      await sendHelpMessage(bot, chatId);
    } else if (query.data === "join_circle_help") {
      await bot.sendMessage(chatId, "To join a circle, ask your friend for an invite link or create one in the app!");
    }
  });

  // Helper for Help Message
  async function sendHelpMessage(bot: TelegramBot, chatId: number) {
    const helpMessage = `
📖 *Minties Commands*:

🎁 *Gifts*:
/gift create - Create a new gift
/gift claim <link> - Claim a gift from a link

💰 *Savings Circles*:
/circle create - Create a new savings circle
/circle join <id> - Join a savings circle

🔐 *Wallet*:
/wallet connect - Connect MetaMask wallet
/wallet balance - Check your USDC balance

Need help? Contact support: @mintiessupport
    `;
    await bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
  }

  // Inline Query Handler (Search Bar Integration)
  bot.on("inline_query", async (query) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const results: TelegramBot.InlineQueryResult[] = [
      {
        type: "article",
        id: "moneybox",
        title: "💰 My Moneybox",
        description: "Check your savings goals",
        input_message_content: {
          message_text: "I'm checking my savings goals on Minties! 🎯",
        },
        reply_markup: {
          inline_keyboard: [[
            { text: "View Moneybox 💰", web_app: { url: `${frontendUrl}/moneybox` } }
          ]]
        },
        thumb_url: "https://emojigraph.org/media/apple/money-bag_1f4b0.png"
      },
      {
        type: "article",
        id: "send_gift",
        title: "🎁 Send a Gift",
        description: "Send crypto to a friend",
        input_message_content: {
          message_text: "Here's a gift for you! 🎁",
        },
        reply_markup: {
          inline_keyboard: [[
            { text: "Claim Gift 🎁", web_app: { url: `${frontendUrl}/gift/claim` } } // Generic claim landing
          ]]
        },
        thumb_url: "https://emojigraph.org/media/apple/wrapped-gift_1f381.png"
      },
      {
        type: "article",
        id: "invite",
        title: "👋 Invite Friend",
        description: "Invite friends to Minties",
        input_message_content: {
          message_text: "Join me on Minties to save and earn! 🚀",
        },
        reply_markup: {
          inline_keyboard: [[
            { text: "Join Minties 🚀", web_app: { url: frontendUrl } }
          ]]
        }
      }
    ];

    await bot.answerInlineQuery(query.id, results, { cache_time: 0 });
  });

  // Gift commands
  bot.onText(/\/gift/, handleGiftCommands(bot));

  // Circle commands
  bot.onText(/\/circle/, handleCircleCommands(bot));

  // Wallet commands
  bot.onText(/\/wallet/, handleWalletCommands(bot));

  // Invite commands
  bot.onText(/\/invite/, handleInviteCommands(bot));

  // Stats/Profile command
  bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(
      chatId,
      `📊 *Your Stats:*\n\nUse the Mini App to see your points, badges, and progress!`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🚀 Open Mini App",
                web_app: { url: process.env.FRONTEND_URL || "http://localhost:3000" },
              },
            ],
          ],
        },
      }
    );
  });

  // Handle data from Mini App
  bot.on("message", async (msg) => {
    if (msg.web_app_data) {
      try {
        const data = JSON.parse(msg.web_app_data.data);
        const chatId = msg.chat.id;

        console.log("Received data from Mini App:", data);

        // Handle different types of data from Mini App
        if (data.type === "gift_claimed") {
          await bot.sendMessage(
            chatId,
            `✅ *Gift claimed successfully!*\n\nAmount: ${data.amount} USDC\nTransaction: \`${data.txHash || "Pending"}\``,
            { parse_mode: "Markdown" }
          );
        } else if (data.type === "gift_sent") {
          await bot.sendMessage(
            chatId,
            `🎁 *Gift sent!*\n\nRecipient: ${data.recipient}\nAmount: ${data.amount} USDC`,
            { parse_mode: "Markdown" }
          );
        } else if (data.type === "circle_contribution") {
          await bot.sendMessage(
            chatId,
            `✅ *Contribution made!*\n\nCircle: ${data.circleId}\nAmount: ${data.amount} USDC`,
            { parse_mode: "Markdown" }
          );
        } else {
          // Default ack
          // await bot.sendMessage(chatId, "✅ Received app data");
        }
      } catch (error) {
        console.error("Error processing Mini App data:", error);
      }
    }
  });

  // Error handling
  bot.on("polling_error", (error) => {
    console.error("Telegram bot polling error:", error);
  });

  // Configure Menu Button
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  try {
    // @ts-ignore
    bot.setChatMenuButton({
      menu_button: {
        type: "web_app",
        text: "Open Minties",
        web_app: { url: frontendUrl }
      }
    });
  } catch (error) {
    console.warn("Failed to set menu button:", error);
    console.warn("DEBUG: Ensure FRONTEND_URL matches your Vercel URL (HTTPS). Current:", frontendUrl);
  }

  // Handle Contact Sharing (Legacy/Direct)
  bot.on("contact", async (msg) => {
    const chatId = msg.chat.id;
    const contact = msg.contact;
    if (!contact || !msg.from) return;

    if (contact.user_id !== msg.from.id) {
      await bot.sendMessage(chatId, "⚠️ Please share your *own* contact.", { parse_mode: "Markdown" });
      return;
    }
    try {
      if (supabase) {
        // Sync to Supabase
        const { error } = await supabase.from('contacts').upsert({
          telegram_user_id: contact.user_id,
          phone_number: contact.phone_number,
          first_name: contact.first_name,
          last_name: contact.last_name,
          updated_at: new Date().toISOString()
        }, { onConflict: 'telegram_user_id' });

        if (error) throw error;

        await bot.sendMessage(chatId, "✅ Contact synced! You can now be discovered by friends in Minties.", {
          reply_markup: { remove_keyboard: true }
        });
      } else {
        await bot.sendMessage(chatId, "⚠️ Backend database not connected. Contact not saved.");
      }
    } catch (err) {
      console.error("Error syncing contact:", err);
      await bot.sendMessage(chatId, "❌ Failed to sync contact. Please try again.");
    }
  });

  console.log("✅ Telegram bot handlers registered");
}

