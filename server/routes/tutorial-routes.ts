import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Define Zod schema for tutorial status update
const tutorialStatusSchema = z.object({
  completed: z.boolean(),
  lastSection: z.string().optional()
});

// Get tutorial status for a user
router.get('/status', async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const status = await storage.getTutorialStatus(userId);
    return res.json(status);
  } catch (error) {
    console.error('Error getting tutorial status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update tutorial status for a user
router.post('/status', async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Validate request body
    const validatedData = tutorialStatusSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({ message: 'Invalid request body', errors: validatedData.error.flatten() });
    }

    const { completed, lastSection } = validatedData.data;
    const success = await storage.updateTutorialStatus(userId, completed, lastSection);

    if (success) {
      return res.json({ message: 'Tutorial status updated successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to update tutorial status' });
    }
  } catch (error) {
    console.error('Error updating tutorial status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;