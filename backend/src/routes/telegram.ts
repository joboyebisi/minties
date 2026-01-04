import { Router } from "express";
import { verifyTelegramWebAppInitData, parseTelegramInitData } from "../utils/telegramAuth.js";

export const telegramRoutes = Router();

// Verify Telegram initData
telegramRoutes.post("/verify", async (req, res) => {
  try {
    const { initData } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!initData) {
      return res.status(400).json({ success: false, error: "initData is required" });
    }

    if (!botToken) {
      return res.status(500).json({ success: false, error: "Bot token not configured" });
    }

    // Verify the initData
    const isValid = verifyTelegramWebAppInitData(initData, botToken);

    if (!isValid) {
      return res.status(401).json({ success: false, error: "Invalid initData" });
    }

    // Parse user data
    const userData = parseTelegramInitData(initData);

    res.json({
      success: true,
      user: userData?.user,
      queryId: userData?.queryId,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Webhook handler for Telegram updates
telegramRoutes.post("/webhook", (req, res) => {
  const { bot } = require("../telegram/client"); // Import dynamically to verify singleton
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

