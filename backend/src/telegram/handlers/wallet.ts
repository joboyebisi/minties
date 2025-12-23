import TelegramBot from "node-telegram-bot-api";
import { connectWallet, getWalletAddress, getBalance } from "../../services/wallet.js";

export function handleWalletCommands(bot: TelegramBot) {
  return async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;
    const text = msg.text || "";
    const args = text.split(" ").slice(1);

    try {
      if (args[0] === "connect") {
        // Generate connection link with delegation
        const connectionLink = await connectWallet(chatId.toString());
        
        await bot.sendMessage(chatId,
          `🔐 Connect Your MetaMask Wallet\n\n` +
          `Click the link below to connect:\n${connectionLink}\n\n` +
          `This will create a MetaMask Smart Account if you don't have one.`
        );
      } else if (args[0] === "address") {
        const address = await getWalletAddress(chatId.toString());
        if (address) {
          await bot.sendMessage(chatId, `📍 Your wallet address:\n\`${address}\``, { parse_mode: "Markdown" });
        } else {
          await bot.sendMessage(chatId, "❌ No wallet connected. Use /wallet connect first.");
        }
      } else if (args[0] === "balance") {
        const balance = await getBalance(chatId.toString());
        if (balance !== null) {
          await bot.sendMessage(chatId, `💰 Your USDC balance: ${balance} USDC`);
        } else {
          await bot.sendMessage(chatId, "❌ Could not fetch balance. Make sure your wallet is connected.");
        }
      } else {
        await bot.sendMessage(chatId,
          "🔐 Wallet Commands:\n\n" +
          "/wallet connect - Connect MetaMask wallet\n" +
          "/wallet address - Show your address\n" +
          "/wallet balance - Check USDC balance"
        );
      }
    } catch (error) {
      console.error("Error handling wallet command:", error);
      await bot.sendMessage(chatId, "❌ An error occurred. Please try again.");
    }
  };
}

