import TelegramBot from "node-telegram-bot-api";
import { createCircle, joinCircle, contributeToCircle, getCircleStatus } from "../../services/circle.js";

export function handleCircleCommands(bot: TelegramBot) {
  return async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;
    const text = msg.text || "";
    const args = text.split(" ").slice(1);

    try {
      if (args[0] === "create") {
        await bot.sendMessage(chatId, 
          "💰 Create a Savings Circle\n\n" +
          "Please send the weekly target amount per member in USDC (e.g., 50):"
        );
        
        bot.once("message", async (amountMsg) => {
          if (amountMsg.from?.id !== msg.from?.id) return;
          
          const targetAmount = parseFloat(amountMsg.text || "0");
          if (isNaN(targetAmount) || targetAmount <= 0) {
            await bot.sendMessage(chatId, "❌ Invalid amount. Please try again.");
            return;
          }

          const circleId = await createCircle(chatId.toString(), targetAmount);
          
          await bot.sendMessage(chatId,
            `✅ Savings Circle created!\n\n` +
            `🆔 Circle ID: ${circleId}\n` +
            `💰 Weekly target: ${targetAmount} USDC per member\n\n` +
            `Share this ID with friends to join: ${circleId}`
          );
        });
      } else if (args[0] === "join") {
        const circleId = args[1];
        if (!circleId) {
          await bot.sendMessage(chatId, "❌ Please provide a circle ID.\nUsage: /circle join <id>");
          return;
        }

        const result = await joinCircle(chatId.toString(), circleId);
        if (result.success) {
          await bot.sendMessage(chatId, `✅ Joined savings circle: ${circleId}`);
        } else {
          await bot.sendMessage(chatId, `❌ Failed to join: ${result.error}`);
        }
      } else if (args[0] === "contribute") {
        const circleId = args[1];
        const amount = parseFloat(args[2] || "0");
        
        if (!circleId || isNaN(amount) || amount <= 0) {
          await bot.sendMessage(chatId, "❌ Usage: /circle contribute <id> <amount>");
          return;
        }

        const result = await contributeToCircle(chatId.toString(), circleId, amount);
        if (result.success) {
          await bot.sendMessage(chatId, 
            `✅ Contributed ${amount} USDC to circle ${circleId}\n` +
            `📝 Transaction: ${result.txHash}`
          );
        } else {
          await bot.sendMessage(chatId, `❌ Failed to contribute: ${result.error}`);
        }
      } else if (args[0] === "status") {
        const circleId = args[1];
        if (!circleId) {
          await bot.sendMessage(chatId, "❌ Usage: /circle status <id>");
          return;
        }

        const status = await getCircleStatus(circleId);
        await bot.sendMessage(chatId,
          `📊 Circle Status: ${circleId}\n\n` +
          `💰 Total contributed: ${status.totalContributed} USDC\n` +
          `👥 Members: ${status.memberCount}\n` +
          `🔒 Locked: ${status.lockedAmount} USDC\n` +
          `📈 Yield: ${status.yieldPercentage}%\n` +
          `🔄 Cycle: ${status.cycleNumber}`
        );
      } else {
        await bot.sendMessage(chatId,
          "💰 Savings Circle Commands:\n\n" +
          "/circle create - Create a new circle\n" +
          "/circle join <id> - Join a circle\n" +
          "/circle contribute <id> <amount> - Contribute\n" +
          "/circle status <id> - Check status"
        );
      }
    } catch (error) {
      console.error("Error handling circle command:", error);
      await bot.sendMessage(chatId, "❌ An error occurred. Please try again.");
    }
  };
}

