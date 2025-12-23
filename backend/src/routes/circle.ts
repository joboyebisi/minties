import { Router } from "express";
import { createCircle, joinCircle, contributeToCircle, getCircleStatus } from "../services/circle.js";

export const circleRoutes = Router();

// Create a savings circle
circleRoutes.post("/create", async (req, res) => {
  try {
    const { userId, targetAmount } = req.body;
    const circleId = await createCircle(userId, targetAmount);
    res.json({ success: true, circleId });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Join a circle
circleRoutes.post("/join", async (req, res) => {
  try {
    const { userId, circleId } = req.body;
    const result = await joinCircle(userId, circleId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Contribute to a circle
circleRoutes.post("/contribute", async (req, res) => {
  try {
    const { userId, circleId, amount } = req.body;
    const result = await contributeToCircle(userId, circleId, amount);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get circle status
circleRoutes.get("/:circleId/status", async (req, res) => {
  try {
    const { circleId } = req.params;
    const status = await getCircleStatus(circleId);
    res.json({ success: true, status });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

