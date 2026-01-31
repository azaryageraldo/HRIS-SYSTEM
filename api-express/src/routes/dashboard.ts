import { Router } from 'express';
import DashboardController from '../controllers/dashboardController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// All dashboard routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole(1)); // Admin only

/**
 * GET /api/admin/dashboard/stats
 * Get dashboard statistics
 */
router.get('/stats', DashboardController.getStats);

export default router;
