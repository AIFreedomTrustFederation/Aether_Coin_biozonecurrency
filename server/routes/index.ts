import express from 'express';
import achievementsRoutes from './achievements';
import nftBadgesRoutes from './nftBadges';

const router = express.Router();

// API routes
router.use('/achievements', achievementsRoutes);
router.use('/nft-badges', nftBadgesRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;