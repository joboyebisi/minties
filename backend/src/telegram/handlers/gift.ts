import TelegramBot from "node-telegram-bot-api";
import { createGiftLink, claimGift } from "../../services/gift.js";
import { encodeDelegation } from "../../utils/delegation.js";

export function handleGiftCommands(bot: TelegramBot) {
  return async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;
    const text = msg.text || "";
    const args = text.split(" ").slice(1);

    try {
      if (args[0] === "create") {
        // Interactive gift creation
        await bot.sendMessage(chatId, "🎁 Let's create a gift!\n\nPlease send the amount in USDC (e.g., 10):");
        
        bot.once("message", async (amountMsg) => {
          if (amountMsg.from?.id !== msg.from?.id) return;
          
          const amount = parseFloat(amountMsg.text || "0");
          if (isNaN(amount) || amount <= 0) {
            await bot.sendMessage(chatId, "❌ Invalid amount. Please try again.");
            return;
          }

          await bot.sendMessage(chatId, "What type of gift?\n1. Single-use (one person can claim)\n2. Multi-use (multiple people can claim)\n\nReply with 1 or 2:");
          
          bot.once("message", async (typeMsg) => {
            if (typeMsg.from?.id !== msg.from?.id) return;
            
            const type = typeMsg.text === "1" ? "single" : "multi";
            const giftId = `gift_${Date.now()}_${chatId}`;
            
            // Create gift link using delegation
            const link = await createGiftLink(chatId.toString(), amount, type);
            
            await bot.sendMessage(chatId, 
              `✅ Gift created!\n\n` +
              `💰 Amount: ${amount} USDC\n` +
              `📋 Type: ${type === "single" ? "Single-use" : "Multi-use"}\n\n` +
              `🔗 Share this link:\n${link}\n\n` +
              `Anyone with this link can claim the gift!`
            );
          });
        });
      } else if (args[0] === "claim") {
        const link = args[1];
        if (!link) {
          await bot.sendMessage(chatId, "❌ Please provide a gift link.\nUsage: /gift claim <link>");
          return;
        }

        await bot.sendMessage(chatId, "⏳ Claiming gift...");
        const result = await claimGift(chatId.toString(), link);
        
        if (result.success) {
          await bot.sendMessage(chatId, 
            `✅ Gift claimed successfully!\n\n` +
            `💰 Amount: ${result.amount} USDC\n` +
            `📝 Transaction: ${result.txHash}`
          );
        } else {
          await bot.sendMessage(chatId, `❌ Failed to claim gift: ${result.error}`);
        }
      } else {
        await bot.sendMessage(chatId, 
          "🎁 Gift Commands:\n\n" +
          "/gift create - Create a new gift\n" +
          "/gift claim <link> - Claim a gift\n" +
          "/gift list - List your gifts"
        );
      }
    } catch (error) {
      console.error("Error handling gift command:", error);
      await bot.sendMessage(chatId, "❌ An error occurred. Please try again.");
    }
  };
}

