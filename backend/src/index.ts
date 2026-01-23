import express from "express";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { giftRoutes } from "./routes/gift.js";
import { circleRoutes } from "./routes/circle.js";
import { walletRoutes } from "./routes/wallet.js";
import { telegramRoutes } from "./routes/telegram.js";
import { envioRoutes } from "./routes/envio.js";
import { setupTelegramBot } from "./telegram/bot.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Initialize Telegram Bot
// import { bot } from "./telegram/client.js"; // Legacy
import { setupGrammyBot } from "./telegram/grammyBot.js";

const BACKEND_URL = process.env.BACKEND_URL;

// Initialize Grammy Bot (Agent)
setupGrammyBot();

/* Legacy Bot Logic (Disabled)
if (BACKEND_URL) {
  const webhookUrl = `${BACKEND_URL}/api/telegram/webhook`;
  console.log(`🌍 Setting up Telegram Webhook at: ${webhookUrl}`);
  // ...
} else {
  // ...
}
setupTelegramBot(bot);
*/

// API Routes
app.use("/api/gift", giftRoutes);
app.use("/api/circle", circleRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/telegram", telegramRoutes);
app.use("/api/envio", envioRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Minties backend server running on port ${PORT}`);
  console.log(`📱 Telegram bot initialized`);
});

