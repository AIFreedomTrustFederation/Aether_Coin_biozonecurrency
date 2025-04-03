import { Router } from 'express';
import widgetRoutes from './widgets/routes';

const router = Router();

// Register all API gateway routes
router.use('/widgets', widgetRoutes);

export default router;