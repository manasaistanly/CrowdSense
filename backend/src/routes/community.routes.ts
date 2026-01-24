import express, { Response } from 'express';
import { communityService } from '../services/community.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * GET /api/v1/community/feedback/:destinationId
 * Get public feedback for a destination
 */
router.get(
    '/feedback/:destinationId',
    async (req: express.Request, res: Response) => {
        try {
            const destinationId = req.params.destinationId as string;
            const feedback = await communityService.getPublicFeedback(destinationId);
            res.json({
                success: true,
                data: feedback,
            });
        } catch (error: any) {
            logger.error('Get community feedback error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * POST /api/v1/community/feedback
 * Submit new feedback
 */
router.post(
    '/feedback',
    authenticate,
    async (req: AuthRequest, res: Response) => {
        try {
            const userId = (req.user as any).id;
            const feedback = await communityService.submitFeedback({
                ...req.body,
                userId
            });

            return res.status(201).json({
                success: true,
                data: feedback,
            });
        } catch (error: any) {
            logger.error('Submit feedback error:', error);
            return res.status(400).json({ error: error.message });
        }
    }
);

/**
 * POST /api/v1/community/feedback/:id/vote
 * Vote on feedback
 */
router.post(
    '/feedback/:id/vote',
    authenticate,
    async (req: AuthRequest, res: Response) => {
        try {
            const { type } = req.body; // 'up' or 'down'
            if (!['up', 'down'].includes(type)) {
                return res.status(400).json({ message: 'Invalid vote type' });
            }

            const feedbackId = req.params.id as string;
            const updated = await communityService.voteFeedback(feedbackId, type);

            return res.json({
                success: true,
                data: updated,
            });
        } catch (error: any) {
            logger.error('Vote feedback error:', error);
            return res.status(400).json({ error: error.message });
        }
    }
);

export const communityRoutes = router;
