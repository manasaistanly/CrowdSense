import express, { Response } from 'express';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { PERMISSIONS } from '../utils/permissions';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * GET /api/v1/pricing/rules/destinations/:destinationId
 * Get all pricing rules for a destination
 */
router.get(
    '/rules/destinations/:destinationId',
    authenticate,
    requirePermission(PERMISSIONS.DESTINATION_VIEW),
    async (req: AuthRequest, res: Response) => {
        try {
            const destinationId = req.params.destinationId as string;

            const rules = await prisma.pricingRule.findMany({
                where: { destinationId },
                orderBy: { priority: 'desc' },
            });

            res.json({
                success: true,
                data: rules,
            });
        } catch (error: any) {
            logger.error('Get pricing rules error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'FETCH_FAILED',
                    message: error.message || 'Failed to fetch pricing rules',
                },
            });
        }
    }
);

/**
 * POST /api/v1/pricing/rules
 * Create a new pricing rule
 */
router.post(
    '/rules',
    authenticate,
    requirePermission(PERMISSIONS.DESTINATION_UPDATE),
    async (req: AuthRequest, res: Response) => {
        try {
            const {
                destinationId,
                ruleName,
                basePrice,
                peakMultiplier,
                offPeakMultiplier,
                adultPrice,
                childPrice,
                localPrice,
                foreignPrice,
                applicableDays,
                startDate,
                endDate,
                priority,
                isActive,
            } = req.body;

            // Basic validation
            if (!destinationId || !ruleName || basePrice === undefined) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Missing required fields',
                    },
                });
            }

            const rule = await prisma.pricingRule.create({
                data: {
                    destinationId,
                    ruleName,
                    basePrice,
                    peakMultiplier: peakMultiplier || 1.0,
                    offPeakMultiplier: offPeakMultiplier || 1.0,
                    adultPrice,
                    childPrice,
                    localPrice,
                    foreignPrice,
                    applicableDays: applicableDays || [],
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null,
                    priority: priority || 0,
                    isActive: isActive ?? true,
                },
            });

            logger.info(`Pricing rule created: ${rule.id} for destination ${destinationId}`);

            return res.status(201).json({
                success: true,
                data: rule,
                message: 'Pricing rule created successfully',
            });
        } catch (error: any) {
            logger.error('Create pricing rule error:', error);
            return res.status(400).json({
                success: false,
                error: {
                    code: 'CREATE_FAILED',
                    message: error.message || 'Failed to create pricing rule',
                },
            });
        }
    }
);

/**
 * PUT /api/v1/pricing/rules/:id
 * Update a pricing rule
 */
router.put(
    '/rules/:id',
    authenticate,
    requirePermission(PERMISSIONS.DESTINATION_UPDATE),
    async (req: AuthRequest, res: Response) => {
        try {
            const id = req.params.id as string;
            const data = req.body;

            // Handle date conversions if present
            if (data.startDate) data.startDate = new Date(data.startDate);
            if (data.endDate) data.endDate = new Date(data.endDate);

            const rule = await prisma.pricingRule.update({
                where: { id },
                data,
            });

            logger.info(`Pricing rule updated: ${id}`);

            res.json({
                success: true,
                data: rule,
                message: 'Pricing rule updated successfully',
            });
        } catch (error: any) {
            logger.error('Update pricing rule error:', error);
            res.status(400).json({
                success: false,
                error: {
                    code: 'UPDATE_FAILED',
                    message: error.message || 'Failed to update pricing rule',
                },
            });
        }
    }
);

/**
 * DELETE /api/v1/pricing/rules/:id
 * Delete a pricing rule
 */
router.delete(
    '/rules/:id',
    authenticate,
    requirePermission(PERMISSIONS.DESTINATION_UPDATE),
    async (req: AuthRequest, res: Response) => {
        try {
            const id = req.params.id as string;

            await prisma.pricingRule.delete({
                where: { id },
            });

            logger.info(`Pricing rule deleted: ${id}`);

            res.json({
                success: true,
                message: 'Pricing rule deleted successfully',
            });
        } catch (error: any) {
            logger.error('Delete pricing rule error:', error);
            res.status(400).json({
                success: false,
                error: {
                    code: 'DELETE_FAILED',
                    message: error.message || 'Failed to delete pricing rule',
                },
            });
        }
    }
);

export default router;
