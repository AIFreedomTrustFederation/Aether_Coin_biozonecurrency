import { Router } from 'express';
import widgetsRouter from './widgets';

const router = Router();

// Version the API for future expansion
const apiVersion = 'v1';

// Add health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', version: apiVersion });
});

// Register widget system routes
router.use('/widgets', widgetsRouter);

// Future API gateway routes can be added here
// For example:
// router.use('/ai', aiRouter);
// router.use('/matrix', matrixRouter);
// router.use('/quantum', quantumRouter);

export default router;