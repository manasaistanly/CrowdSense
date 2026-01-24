import { Router, Response } from 'express';
import { destinationService } from '../services/destination.service';
import { authenticate, authorize, optionalAuth, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { PERMISSIONS } from '../utils/permissions';
import { logger } from '../utils/logger';
import { pricingService } from '../services/pricing.service';

import { validate } from '../middleware/validate';
import { createDestinationSchema } from '../utils/validationSchemas';

const router = Router();

/**
 * GET /api/v1/destinations
 * List all destinations (public with optional auth)
 */
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { page, limit, type, status, search, sortBy } = req.query;

        const result = await destinationService.getDestinations({
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined,
            type: type as string,
            status: status as string,
            search: search as string,
            sortBy: sortBy as string,
        });

        return res.json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        logger.error('Get destinations error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_FAILED',
                message: error.message || 'Failed to fetch destinations',
            },
        });
    }
});

/**
 * GET /api/v1/destinations/:idOrSlug
 * Get destination details
 */
router.get('/:idOrSlug', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { idOrSlug } = req.params;
        const destination = await destinationService.getDestinationById(idOrSlug as string);

        return res.json({
            success: true,
            data: { destination },
        });
    } catch (error: any) {
        logger.error('Get destination error:', error);
        return res.status(404).json({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: error.message || 'Destination not found',
            },
        });
    }
});

/**
 * GET /api/v1/destinations/:id/capacity
 * Get real-time capacity
 */
router.get('/:id/capacity', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const capacity = await destinationService.getCapacity(id as string);

        return res.json({
            success: true,
            data: capacity,
        });
    } catch (error: any) {
        logger.error('Get capacity error:', error);
        return res.status(404).json({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: error.message || 'Destination not found',
            },
        });
    }
});

/**
 * GET /api/v1/destinations/:id/availability
 * Get availability calendar
 */
router.get('/:id/availability', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { days } = req.query;

        const calendar = await destinationService.getAvailabilityCalendar(
            id as string,
            days ? parseInt(days as string) : 7
        );

        return res.json({
            success: true,
            data: { calendar },
        });
    } catch (error: any) {
        logger.error('Get availability error:', error);
        return res.status(404).json({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: error.message || 'Destination not found',
            },
        });
    }
});

/**
 * GET /api/v1/destinations/:id/quote
 * Get price quote
 */
router.get('/:id/quote', optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { date, visitors } = req.query;

        // Basic validation
        if (!date || !visitors) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Date and visitors count required'
                }
            });
            return;
        }

        const price = await pricingService.calculatePrice(
            id as string,
            new Date(date as string),
            parseInt(visitors as string)
        );

        return res.json({
            success: true,
            data: price,
        });
    } catch (error: any) {
        logger.error('Get quote error:', error);
        return res.status(400).json({
            success: false,
            error: {
                code: 'CALCULATION_FAILED',
                message: error.message || 'Failed to calculate price',
            },
        });
    }
});

/**
 * POST /api/v1/destinations
 * Create destination (Admin only)
 */
router.post(
    '/',
    authenticate,
    authorize(['SUPER_ADMIN', 'DESTINATION_ADMIN']),
    validate(createDestinationSchema),
    async (req: AuthRequest, res: Response) => {
        try {
            const destination = await destinationService.createDestination(req.body);

            return res.status(201).json({
                success: true,
                data: { destination },
                message: 'Destination created successfully',
            });
        } catch (error: any) {
            logger.error('Create destination error:', error);
            return res.status(400).json({
                success: false,
                error: {
                    code: 'CREATE_FAILED',
                    message: error.message || 'Failed to create destination',
                },
            });
        }
    }
);

/**
 * PATCH /api/v1/destinations/:id
 * Update destination
 */
router.patch(
    '/:id',
    authenticate,
    requirePermission(PERMISSIONS.DESTINATION_UPDATE),
    async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params;
            const destination = await destinationService.updateDestination(id as string, req.body);

            return res.json({
                success: true,
                data: { destination },
                message: 'Destination updated successfully',
            });
        } catch (error: any) {
            logger.error('Update destination error:', error);
            return res.status(400).json({
                success: false,
                error: {
                    code: 'UPDATE_FAILED',
                    message: error.message || 'Failed to update destination',
                },
            });
        }
    }
);

/**
 * DELETE /api/v1/destinations/:id
 * Delete destination
 */
router.delete(
    '/:id',
    authenticate,
    requirePermission(PERMISSIONS.DESTINATION_DELETE),
    async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params;
            await destinationService.deleteDestination(id as string);

            return res.json({
                success: true,
                message: 'Destination deleted successfully',
            });
        } catch (error: any) {
            logger.error('Delete destination error:', error);
            return res.status(400).json({
                success: false,
                error: {
                    code: 'DELETE_FAILED',
                    message: error.message || 'Failed to delete destination',
                },
            });
        }
    }
);

export default router;
