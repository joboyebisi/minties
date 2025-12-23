import { Router } from "express";
import { createGiftLink, claimGift } from "../services/gift.js";

export const giftRoutes = Router();

// Create a gift link
giftRoutes.post("/create", async (req, res) => {
  try {
    const { userId, amount, type } = req.body;
    const link = await createGiftLink(userId, amount, type);
    res.json({ success: true, link });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Claim a gift
giftRoutes.post("/claim", async (req, res) => {
  try {
    const { userId, link } = req.body;
    const result = await claimGift(userId, link);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

