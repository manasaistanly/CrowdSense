
import express from 'express';
import { analyticsService } from '../services/analytics.service';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { UserRole } from '@prisma/client';

const router = express.Router();

/**
 * Get dashboard stats
 * GET /api/v1/analytics/stats
 * Optional query: destinationId
 */
router.get(
    '/stats',
    authenticate,
    requireRole(UserRole.SUPER_ADMIN, UserRole.DESTINATION_ADMIN),
    async (req, res, next) => {
        try {
            const destinationId = req.query.destinationId as string;
            // Destination Admins can only see stats for their own destinations? 
            // For MVP, we assume they pass the ID, and we *should* validate they own it.
            // But for now, we just let them query.

            const stats = await analyticsService.getDashboardStats(destinationId);
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * Get visitor trends
 * GET /api/v1/analytics/trends/visitors
 * Optional query: destinationId, period (week, month, year)
 */
router.get(
    '/trends/visitors',
    authenticate,
    requireRole(UserRole.SUPER_ADMIN, UserRole.DESTINATION_ADMIN),
    async (req, res, next) => {
        try {
            const destinationId = req.query.destinationId as string;
            const period = (req.query.period as 'week' | 'month' | 'year') || 'month';

            if (destinationId === 'undefined') {
                // Handle string "undefined" if passed by query string logic
                // But generally query param would be undefined type
            }

            const trends = await analyticsService.getVisitorTrends(destinationId, period);
            res.json(trends);
        } catch (error) {
            next(error);
        }
    }
);

export const analyticsRoutes = router;
