import { Router } from "express";
import { connectWallet, getWalletAddress, getBalance, storeWallet } from "../services/wallet.js";

export const walletRoutes = Router();

// Connect wallet
walletRoutes.post("/connect", async (req, res) => {
  try {
    const { userId } = req.body;
    const link = await connectWallet(userId);
    res.json({ success: true, link });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get wallet address
walletRoutes.get("/:userId/address", async (req, res) => {
  try {
    const { userId } = req.params;
    const address = await getWalletAddress(userId);
    res.json({ success: true, address });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get balance
walletRoutes.get("/:userId/balance", async (req, res) => {
  try {
    const { userId } = req.params;
    const balance = await getBalance(userId);
    res.json({ success: true, balance });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Store wallet (called from frontend after connection)
walletRoutes.post("/store", async (req, res) => {
  try {
    const { userId, wallet } = req.body;
    storeWallet(userId, wallet);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

