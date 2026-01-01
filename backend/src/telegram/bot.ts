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

    // Send welcome message with Mini App button
    await bot.sendMessage(chatId, "🎁 Welcome to Minties!", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚀 Open Mini App",
              web_app: { url: frontendUrl },
            },
          ],
        ],
      },
    });

    const welcomeMessage = `
Send crypto gifts, schedule transactions, and start savings circles with friends on Telegram!

Commands:
/gift - Create a claimable USDC gift link
/circle - Create or join a savings circle
/wallet - Connect your MetaMask wallet
/webapp - Open the Mini App
/help - Show all commands
    `;
    await bot.sendMessage(chatId, welcomeMessage);
  });

  // Web App command
  bot.onText(/\/webapp/, async (msg) => {
    const chatId = msg.chat.id;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    await bot.sendMessage(chatId, "Opening Minties Mini App...", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚀 Open Mini App",
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
    const helpMessage = `
📖 Minties Commands:

🎁 Gifts:
/gift create - Create a new gift
/gift claim <link> - Claim a gift from a link
/gift list - List your created gifts

💰 Savings Circles:
/circle create - Create a new savings circle
/circle join <id> - Join a savings circle
/circle contribute <id> <amount> - Contribute to a circle
/circle status <id> - Check circle status

🔐 Wallet:
/wallet connect - Connect MetaMask wallet
/wallet address - Show your wallet address
/wallet balance - Check your USDC balance

Need help? Contact support: @mintiessupport
    `;
    await bot.sendMessage(chatId, helpMessage);
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
    const userId = msg.from?.id;
    if (!userId) return;

    // TODO: Fetch from Supabase and show user stats
    await bot.sendMessage(
      chatId,
      `📊 Your Stats:\n\nUse the Mini App to see your points, badges, and progress!`,
      {
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
            `✅ Gift claimed successfully!\n\nAmount: ${data.amount} USDC\nTransaction: ${data.txHash || "Pending"}`
          );
        } else if (data.type === "gift_sent") {
          await bot.sendMessage(
            chatId,
            `🎁 Gift sent!\n\nRecipient: ${data.recipient}\nAmount: ${data.amount} USDC\nLink: ${data.giftLink || "Generated"}`
          );
        } else if (data.type === "circle_contribution") {
          await bot.sendMessage(
            chatId,
            `✅ Contribution made!\n\nCircle: ${data.circleId}\nAmount: ${data.amount} USDC`
          );
        } else if (data.type === "savings_goal_created") {
          await bot.sendMessage(
            chatId,
            `🎯 Savings goal created!\n\nTarget: ${data.targetAmount} USDC\nMonths: ${data.months}\nYou earned ${data.pointsEarned || 50} points!`
          );
        } else if (data.type === "invite_shared") {
          await bot.sendMessage(
            chatId,
            `📤 Invite shared!\n\nCode: ${data.inviteCode}\nShare this code with friends to earn points when they join!`
          );
        } else {
          await bot.sendMessage(chatId, `✅ Action completed: ${data.type || "unknown"}`);
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
    // @ts-ignore - setChatMenuButton might not be in typed definition yet
    bot.setChatMenuButton({
      menu_button: {
        type: "web_app",
        text: "Launch App",
        web_app: { url: frontendUrl }
      }
    });
  } catch (error) {
    console.warn("Failed to set menu button:", error);
  }

  // Handle Contact Sharing
  bot.on("contact", async (msg) => {
    const chatId = msg.chat.id;
    const contact = msg.contact;

    if (!contact || !msg.from) return;

    // Verify contact belongs to sender (security check)
    if (contact.user_id !== msg.from.id) {
      await bot.sendMessage(chatId, "⚠️ Please share your own contact.");
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

