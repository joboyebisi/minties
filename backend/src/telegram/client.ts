import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is required");
}

// We initially create the bot without options to defer connection method
// The options will be set when we initialize it in initTelegramBot
export const bot = new TelegramBot(token, { polling: false }); 
