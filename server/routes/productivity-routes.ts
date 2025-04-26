/**
 * Productivity Dashboard API Routes
 * Routes for handling developer productivity tracking, goals, time blocks, and insights
 */

import express from "express";
import { z } from "zod";
import { storage } from "../storage";
import {
  insertDeveloperActivitySchema,
  insertDeveloperGoalSchema,
  insertTimeBlockSchema,
  insertProductivityMetricSchema,
  insertProductivityInsightSchema
} from "@shared/schema";

const router = express.Router();

// ============= Developer Activity Routes =============

// Get activities for a user
router.get("/activities", async (req, res) => {
  try {
    // For demo purposes, use userId 1
    const userId = 1;
    const activities = await storage.getDeveloperActivitiesByUserId(userId);
    res.json(activities || []);
  } catch (error) {
    console.error("Error fetching developer activities:", error);
    res.status(500).json({ message: "Failed to fetch developer activities" });
  }
});

// Create a new developer activity
router.post("/activities", async (req, res) => {
  try {
    const activityData = insertDeveloperActivitySchema.parse(req.body);
    const activity = await storage.createDeveloperActivity(activityData);
    res.status(201).json(activity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
    }
    console.error("Error creating developer activity:", error);
    res.status(500).json({ message: "Failed to create developer activity" });
  }
});

// ============= Developer Goals Routes =============

// Get goals for a user
router.get("/goals", async (req, res) => {
  try {
    // For demo purposes, use userId 1
    const userId = 1;
    const status = req.query.status as string;
    const goals = await storage.getDeveloperGoalsByUserId(userId, status);
    res.json(goals || []);
  } catch (error) {
    console.error("Error fetching developer goals:", error);
    res.status(500).json({ message: "Failed to fetch developer goals" });
  }
});

// Create a new developer goal
router.post("/goals", async (req, res) => {
  try {
    const goalData = insertDeveloperGoalSchema.parse(req.body);
    const goal = await storage.createDeveloperGoal(goalData);
    res.status(201).json(goal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
    }
    console.error("Error creating developer goal:", error);
    res.status(500).json({ message: "Failed to create developer goal" });
  }
});

// Update a developer goal
router.patch("/goals/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid goal ID" });
    }
    
    const { progress, status } = req.body;
    const updatedGoal = await storage.updateDeveloperGoal(id, { progress, status });
    
    if (!updatedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    
    res.json(updatedGoal);
  } catch (error) {
    console.error("Error updating developer goal:", error);
    res.status(500).json({ message: "Failed to update developer goal" });
  }
});

// ============= Time Block Routes =============

// Get time blocks for a user
router.get("/timeblocks", async (req, res) => {
  try {
    // For demo purposes, use userId 1
    const userId = 1;
    const date = req.query.date as string;
    const timeBlocks = await storage.getTimeBlocksByUserIdAndDate(userId, date);
    res.json(timeBlocks || []);
  } catch (error) {
    console.error("Error fetching time blocks:", error);
    res.status(500).json({ message: "Failed to fetch time blocks" });
  }
});

// Create a new time block
router.post("/timeblocks", async (req, res) => {
  try {
    const timeBlockData = insertTimeBlockSchema.parse(req.body);
    const timeBlock = await storage.createTimeBlock(timeBlockData);
    res.status(201).json(timeBlock);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid time block data", errors: error.errors });
    }
    console.error("Error creating time block:", error);
    res.status(500).json({ message: "Failed to create time block" });
  }
});

// Update a time block
router.patch("/timeblocks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid time block ID" });
    }
    
    const { status, endTime, interruptions, productivity, notes } = req.body;
    const updatedTimeBlock = await storage.updateTimeBlock(id, { 
      status, endTime, interruptions, productivity, notes 
    });
    
    if (!updatedTimeBlock) {
      return res.status(404).json({ message: "Time block not found" });
    }
    
    res.json(updatedTimeBlock);
  } catch (error) {
    console.error("Error updating time block:", error);
    res.status(500).json({ message: "Failed to update time block" });
  }
});

// ============= Productivity Metrics Routes =============

// Get productivity metrics for a user
router.get("/metrics", async (req, res) => {
  try {
    // For demo purposes, use userId 1
    const userId = 1;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const metrics = await storage.getProductivityMetricsByDateRange(userId, startDate, endDate);
    res.json(metrics || []);
  } catch (error) {
    console.error("Error fetching productivity metrics:", error);
    res.status(500).json({ message: "Failed to fetch productivity metrics" });
  }
});

// Get insights for a user
router.get("/insights", async (req, res) => {
  try {
    // For demo purposes, use userId 1
    const userId = 1;
    const insights = await storage.getProductivityInsightsByUserId(userId);
    res.json(insights || []);
  } catch (error) {
    console.error("Error fetching productivity insights:", error);
    res.status(500).json({ message: "Failed to fetch productivity insights" });
  }
});

// Mark an insight as read
router.patch("/insights/:id/read", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid insight ID" });
    }
    
    const updatedInsight = await storage.markProductivityInsightAsRead(id);
    
    if (!updatedInsight) {
      return res.status(404).json({ message: "Insight not found" });
    }
    
    res.json(updatedInsight);
  } catch (error) {
    console.error("Error marking insight as read:", error);
    res.status(500).json({ message: "Failed to mark insight as read" });
  }
});

// For demo purposes, create sample data
router.post("/sample-data", async (req, res) => {
  try {
    // Create sample data for testing
    const userId = 1;
    
    // This would be implemented with real storage methods in production
    const sampleData = {
      activities: [],
      goals: [],
      timeBlocks: [],
      metrics: [],
      insights: []
    };
    
    res.status(201).json({ message: "Sample data created", data: sampleData });
  } catch (error) {
    console.error("Error creating sample data:", error);
    res.status(500).json({ message: "Failed to create sample data" });
  }
});

export default router;