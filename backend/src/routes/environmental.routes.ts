import express, { Response } from 'express';
import { environmentalService } from '../services/environmental.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * GET /api/v1/environmental/summary/:destinationId
 * Get latest metrics summary for dashboard
 */
router.get(
    '/summary/:destinationId',
    authenticate,
    async (req: AuthRequest, res: Response) => {
        try {
            const destinationId = req.params.destinationId as string;
            const summary = await environmentalService.getDashboardSummary(destinationId);
            return res.json({
                success: true,
                data: summary,
            });
        } catch (error: any) {
            logger.error('Get environmental summary error:', error);
            return res.status(500).json({ error: error.message });
        }
    }
);

/**
 * GET /api/v1/environmental/history/:destinationId
 * Get historical metrics
 */
router.get(
    '/history/:destinationId',
    authenticate,
    async (req: AuthRequest, res: Response) => {
        try {
            const destinationId = req.params.destinationId as string;
            const { type, limit } = req.query;
            const history = await environmentalService.getMetrics(
                destinationId,
                type as any,
                limit ? Number(limit) : undefined
            );
            return res.json({
                success: true,
                data: history,
            });
        } catch (error: any) {
            logger.error('Get environmental history error:', error);
            return res.status(500).json({ error: error.message });
        }
    }
);

/**
 * POST /api/v1/environmental
 * Record new metric (Staff/Admin only)
 */
router.post(
    '/',
    authenticate,
    async (req: AuthRequest, res: Response) => {
        try {
            // Allow Destination Admin, Super Admin, and Staff
            const userRole = req.user?.role as UserRole;
            const allowedRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.DESTINATION_ADMIN, UserRole.STAFF];

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }

            const userId = (req.user as any).id; // Safe cast as auth middleware ensures user exists

            const metric = await environmentalService.recordMetric({
                ...req.body,
                recordedById: userId,
            });

            return res.status(201).json({
                success: true,
                data: metric,
            });
        } catch (error: any) {
            logger.error('Record environmental metric error:', error);
            return res.status(400).json({ error: error.message });
        }
    }
);

export const environmentalRoutes = router;
