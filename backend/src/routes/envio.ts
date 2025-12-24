import { Router } from "express";
import {
  getUserGifts,
  getUserGiftClaims,
  getGiftDetails,
  getCircleContributions,
  getCircleDetails,
  getUserActivity,
  getPlatformStats,
  getRecentActivity,
  isGiftClaimed,
  getCircleMembers,
} from "../services/envio.js";

export const envioRoutes = Router();

/**
 * GET /envio/gifts/user/:address
 * Get all gifts created by a user
 */
envioRoutes.get("/gifts/user/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const gifts = await getUserGifts(address);
    res.json({ success: true, gifts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /envio/gifts/claims/:address
 * Get all gifts claimed by a user
 */
envioRoutes.get("/gifts/claims/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const claims = await getUserGiftClaims(address);
    res.json({ success: true, claims });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /envio/gifts/:giftId
 * Get gift details with claim history
 */
envioRoutes.get("/gifts/:giftId", async (req, res) => {
  try {
    const { giftId } = req.params;
    const details = await getGiftDetails(giftId);
    if (!details) {
      return res.status(404).json({ success: false, error: "Gift not found" });
    }
    res.json({ success: true, ...details });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /envio/gifts/:giftId/claimed
 * Check if a gift has been claimed (optionally by specific address)
 */
envioRoutes.get("/gifts/:giftId/claimed", async (req, res) => {
  try {
    const { giftId } = req.params;
    const { claimer } = req.query;
    const claimed = await isGiftClaimed(giftId, claimer as string);
    res.json({ success: true, claimed });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /envio/circles/:circleId/contributions
 * Get all contributions to a circle
 */
envioRoutes.get("/circles/:circleId/contributions", async (req, res) => {
  try {
    const { circleId } = req.params;
    const contributions = await getCircleContributions(circleId);
    res.json({ success: true, contributions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /envio/circles/:circleId
 * Get circle details with latest events
 */
envioRoutes.get("/circles/:circleId", async (req, res) => {
  try {
    const { circleId } = req.params;
    const details = await getCircleDetails(circleId);
    if (!details) {
      return res.status(404).json({ success: false, error: "Circle not found" });
    }
    res.json({ success: true, ...details });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /envio/circles/:circleId/members
 * Get circle members with contribution stats
 */
envioRoutes.get("/circles/:circleId/members", async (req, res) => {
  try {
    const { circleId } = req.params;
    const members = await getCircleMembers(circleId);
    res.json({ success: true, members });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /envio/activity/:address
 * Get user's complete on-chain activity
 */
envioRoutes.get("/activity/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const activity = await getUserActivity(address);
    if (!activity) {
      return res.status(404).json({ success: false, error: "No activity found" });
    }
    res.json({ success: true, ...activity });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /envio/stats
 * Get platform-wide statistics
 */
envioRoutes.get("/stats", async (req, res) => {
  try {
    const stats = await getPlatformStats();
    if (!stats) {
      return res.status(503).json({ success: false, error: "Stats unavailable" });
    }
    res.json({ success: true, stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /envio/activity/recent
 * Get recent activity feed
 */
envioRoutes.get("/activity/recent", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const activity = await getRecentActivity(limit);
    res.json({ success: true, activity });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

