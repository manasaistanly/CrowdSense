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
            console.error('Request Body:', req.body); // Debug log
            return res.status(400).json({
                success: false,
                error: {
                    code: 'SUBMISSION_FAILED',
                    message: error.message || 'Failed to submit feedback'
                }
            });
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

/**
 * GET /api/v1/community/polls/:destinationId
 * Get active polls
 */
router.get(
    '/polls/:destinationId',
    async (req: express.Request, res: Response) => {
        try {
            const destinationId = req.params.destinationId as string;
            // Get userId if authenticated (optional)
            // let userId: string | undefined;

            // Extract token manually since this route might be public-ish but personalized
            // Or we can rely on middleware if we attach it.
            // For now, let's assume we want to know if *this* user voted.
            // Simplified: We'll assume the client sends the token if logged in.
            // But we can't use 'authenticate' middleware if we want it to be public-readable.
            // So we'll parse the header manually if present.
            const authHeader = req.headers.authorization;
            if (authHeader) {
                // Mock: In real app, verify token. 
                // For MVP, we'll try to get userId from the request if the middleware was used optionally.
                // But since we didn't use 'authenticate', req.user is undefined.
                // Let's rely on the client authenticating for personalized views, 
                // OR just make it authenticated-only for simplicity.
                // Decision: Make it authenticated for now to track votes easily.
            }

            // Actually, let's use the 'authenticate' middleware but handle the error?
            // No, let's just make it public. If user is logged in, they should hit an authenticated endpoint?
            // Let's keep it simple: Public endpoint, but if they want to see "my vote", they need encoded ID?

            // Better: Just make it an authenticated route for now to encourage login.
            // Or better yet, we can't easily check "if userId" without middleware.
            // Let's SKIP user-specific vote check in the GET for now unless we add optional auth.

            const polls = await communityService.getPolls(destinationId);
            res.json({
                success: true,
                data: polls,
            });
        } catch (error: any) {
            logger.error('Get polls error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * GET /api/v1/community/polls/:destinationId/user
 * Get active polls (Authenticated - sees own votes)
 */
router.get(
    '/polls/:destinationId/user',
    authenticate,
    async (req: AuthRequest, res: Response) => {
        try {
            const destinationId = req.params.destinationId as string;
            const userId = req.user?.userId;

            const polls = await communityService.getPolls(destinationId, userId);
            res.json({
                success: true,
                data: polls,
            });
        } catch (error: any) {
            logger.error('Get polls user error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * POST /api/v1/community/polls
 * Create a new poll (Admin)
 */
// router.post(
//     '/polls',
//     authenticate,
//     requireRole('DESTINATION_ADMIN', 'SUPER_ADMIN'), // Assuming we have this middleware
//     async (req: AuthRequest, res: Response) => {
//         ...
//     }
// )

/**
 * POST /api/v1/community/polls/:id/vote
 * Vote on a poll
 */
router.post(
    '/polls/:id/vote',
    authenticate,
    async (req: AuthRequest, res: Response) => {
        try {
            const pollId = req.params.id as string;
            const { optionId } = req.body;
            const userId = req.user!.userId;

            const result = await communityService.votePoll(pollId, optionId, userId);

            res.json({
                success: true,
                data: result
            });
        } catch (error: any) {
            logger.error('Vote poll error:', error);
            res.status(400).json({ error: error.message });
        }
    }
);

export const communityRoutes = router;
