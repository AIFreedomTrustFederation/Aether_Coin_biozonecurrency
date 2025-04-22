"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storage_1 = require("../storage");
const schema_1 = require("@shared/schema");
const validateRequest_1 = require("../middleware/validateRequest");
const router = express_1.default.Router();
// Get all achievements
router.get('/', async (req, res) => {
    try {
        const achievements = await storage_1.storage.getAllAchievements();
        res.json(achievements);
    }
    catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});
// Get achievements by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const achievements = await storage_1.storage.getAchievementsByCategory(category);
        res.json(achievements);
    }
    catch (error) {
        console.error('Error fetching achievements by category:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});
// Get a specific achievement
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid achievement ID' });
        }
        const achievement = await storage_1.storage.getAchievement(id);
        if (!achievement) {
            return res.status(404).json({ error: 'Achievement not found' });
        }
        res.json(achievement);
    }
    catch (error) {
        console.error('Error fetching achievement:', error);
        res.status(500).json({ error: 'Failed to fetch achievement' });
    }
});
// Create a new achievement (admin only)
router.post('/', (0, validateRequest_1.validateRequest)(schema_1.insertAchievementSchema), async (req, res) => {
    try {
        // In a production app, we would check for admin permissions here
        const achievement = await storage_1.storage.createAchievement(req.body);
        res.status(201).json(achievement);
    }
    catch (error) {
        console.error('Error creating achievement:', error);
        res.status(500).json({ error: 'Failed to create achievement' });
    }
});
// Award an achievement to a user
router.post('/award', (0, validateRequest_1.validateRequest)(schema_1.insertUserAchievementSchema), async (req, res) => {
    try {
        const userAchievement = await storage_1.storage.awardAchievement(req.body);
        // Record this activity
        await storage_1.storage.recordUserActivity({
            userId: req.body.userId,
            activityType: 'achievement_earned',
            activityData: { achievementId: req.body.achievementId },
            points: 0, // Points are calculated from the achievement itself
        });
        res.status(201).json(userAchievement);
    }
    catch (error) {
        if (error instanceof Error && error.message === 'User already has this achievement') {
            return res.status(409).json({ error: error.message });
        }
        console.error('Error awarding achievement:', error);
        res.status(500).json({ error: 'Failed to award achievement' });
    }
});
// Get all achievements for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const userAchievements = await storage_1.storage.getUserAchievements(userId);
        res.json(userAchievements);
    }
    catch (error) {
        console.error('Error fetching user achievements:', error);
        res.status(500).json({ error: 'Failed to fetch user achievements' });
    }
});
// Check if a user has a specific achievement
router.get('/check/:userId/:achievementId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const achievementId = parseInt(req.params.achievementId);
        if (isNaN(userId) || isNaN(achievementId)) {
            return res.status(400).json({ error: 'Invalid user ID or achievement ID' });
        }
        const hasAchievement = await storage_1.storage.checkUserHasAchievement(userId, achievementId);
        res.json({ hasAchievement });
    }
    catch (error) {
        console.error('Error checking user achievement:', error);
        res.status(500).json({ error: 'Failed to check user achievement' });
    }
});
exports.default = router;
