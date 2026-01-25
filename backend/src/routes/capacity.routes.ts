import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { PERMISSIONS } from '../utils/permissions';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/v1/capacity/destinations/:id
 * Get current capacity for a destination
 */
router.get('/destinations/:id', async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;

        const destination = await prisma.destination.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                maxDailyCapacity: true,
                currentCapacity: true,
                zones: {
                    select: {
                        id: true,
                        name: true,
                        maxCapacity: true,
                        currentCapacity: true,
                    },
                },
            },
        });

        if (!destination) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Destination not found',
                },
            });
            return;
        }

        const percentage = (destination.currentCapacity / destination.maxDailyCapacity) * 100;

        let alertLevel: 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'NORMAL';
        if (percentage >= 95) alertLevel = 'CRITICAL';
        else if (percentage >= 80) alertLevel = 'HIGH';
        else if (percentage >= 60) alertLevel = 'MODERATE';

        res.json({
            success: true,
            data: {
                current: destination.currentCapacity,
                max: destination.maxDailyCapacity,
                percentage: Math.round(percentage * 10) / 10,
                alertLevel,
                zones: destination.zones.map((zone: any) => ({
                    id: zone.id,
                    name: zone.name,
                    current: zone.currentCapacity,
                    max: zone.maxCapacity,
                    percentage: Math.round((zone.currentCapacity / zone.maxCapacity) * 100 * 10) / 10,
                })),
            },
        });
    } catch (error: any) {
        logger.error('Get capacity error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_FAILED',
                message: error.message || 'Failed to fetch capacity',
            },
        });
    }
});

/**
 * POST /api/v1/capacity/destinations/:id/update
 * Update real-time capacity (Staff only)
 */
router.post(
    '/destinations/:id/update',
    authenticate,
    requirePermission(PERMISSIONS.CAPACITY_UPDATE_REALTIME),
    async (req: AuthRequest, res: Response) => {
        try {
            const id = req.params.id as string;
            const { increment, decrement } = req.body;

            if (!increment && !decrement) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Either increment or decrement is required',
                    },
                });
                return;
            }

            const destination = await prisma.destination.update({
                where: { id },
                data: {
                    currentCapacity: {
                        ...(increment && { increment: parseInt(increment) }),
                        ...(decrement && { decrement: parseInt(decrement) }),
                    },
                },
                select: {
                    id: true,
                    currentCapacity: true,
                    maxDailyCapacity: true,
                },
            });

            const percentage = (destination.currentCapacity / destination.maxDailyCapacity) * 100;

            let alertLevel: 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'NORMAL';
            if (percentage >= 95) alertLevel = 'CRITICAL';
            else if (percentage >= 80) alertLevel = 'HIGH';
            else if (percentage >= 60) alertLevel = 'MODERATE';

            res.json({
                success: true,
                data: {
                    current: destination.currentCapacity,
                    max: destination.maxDailyCapacity,
                    percentage: Math.round(percentage * 10) / 10,
                    alertLevel,
                },
                message: 'Capacity updated successfully',
            });
        } catch (error: any) {
            logger.error('Update capacity error:', error);
            res.status(400).json({
                success: false,
                error: {
                    code: 'UPDATE_FAILED',
                    message: error.message || 'Failed to update capacity',
                },
            });
        }
    }
);

/**
 * GET /api/v1/capacity/destinations/:id/history
 * Get capacity history
 */
router.get(
    '/destinations/:id/history',
    authenticate,
    async (req: AuthRequest, res: Response) => {
        try {
            const id = req.params.id as string;
            const { startDate, endDate } = req.query;

            const where: any = { destinationId: id };

            if (startDate || endDate) {
                where.timestamp = {};
                if (startDate) {
                    where.timestamp.gte = new Date(startDate as string);
                }
                if (endDate) {
                    where.timestamp.lte = new Date(endDate as string);
                }
            }

            const history = await prisma.realtimeCapacity.findMany({
                where,
                orderBy: { timestamp: 'desc' },
                take: 100,
                select: {
                    id: true,
                    timestamp: true,
                    currentCount: true,
                    capacityPercentage: true,
                    entriesCount: true,
                    exitsCount: true,
                    alertLevel: true,
                },
            });

            res.json({
                success: true,
                data: { history },
            });
        } catch (error: any) {
            logger.error('Get capacity history error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'FETCH_FAILED',
                    message: error.message || 'Failed to fetch capacity history',
                },
            });
        }
    }
);

/**
 * GET /api/v1/capacity/rules/destinations/:destinationId
 * Get all capacity rules for a destination
 */
router.get(
    '/rules/destinations/:destinationId',
    authenticate,
    requirePermission(PERMISSIONS.DESTINATION_VIEW),
    async (req: AuthRequest, res: Response) => {
        try {
            const destinationId = req.params.destinationId as string;

            const rules = await prisma.capacityRule.findMany({
                where: { destinationId },
                orderBy: { priority: 'desc' },
            });

            res.json({
                success: true,
                data: rules,
            });
        } catch (error: any) {
            logger.error('Get capacity rules error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'FETCH_FAILED',
                    message: error.message || 'Failed to fetch capacity rules',
                },
            });
        }
    }
);

/**
 * POST /api/v1/capacity/rules
 * Create a new capacity rule
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
                ruleType,
                applicableDays,
                startTime,
                endTime,
                startDate,
                endDate,
                capacityPercentage,
                absoluteCapacity,
                priority,
                isActive,
            } = req.body;

            // Basic validation
            if (!destinationId || !ruleName || !ruleType) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Missing required fields',
                    },
                });
            }

            const rule = await prisma.capacityRule.create({
                data: {
                    destinationId,
                    ruleName,
                    ruleType,
                    applicableDays: applicableDays || [],
                    startTime,
                    endTime,
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null,
                    capacityPercentage,
                    absoluteCapacity,
                    priority: priority || 0,
                    isActive: isActive ?? true,
                },
            });

            logger.info(`Capacity rule created: ${rule.id} for destination ${destinationId}`);

            return res.status(201).json({
                success: true,
                data: rule,
                message: 'Capacity rule created successfully',
            });
        } catch (error: any) {
            logger.error('Create capacity rule error:', error);
            return res.status(400).json({
                success: false,
                error: {
                    code: 'CREATE_FAILED',
                    message: error.message || 'Failed to create capacity rule',
                },
            });
        }
    }
);

/**
 * PUT /api/v1/capacity/rules/:id
 * Update a capacity rule
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

            const rule = await prisma.capacityRule.update({
                where: { id },
                data,
            });

            logger.info(`Capacity rule updated: ${id}`);

            res.json({
                success: true,
                data: rule,
                message: 'Capacity rule updated successfully',
            });
        } catch (error: any) {
            logger.error('Update capacity rule error:', error);
            res.status(400).json({
                success: false,
                error: {
                    code: 'UPDATE_FAILED',
                    message: error.message || 'Failed to update capacity rule',
                },
            });
        }
    }
);

/**
 * DELETE /api/v1/capacity/rules/:id
 * Delete a capacity rule
 */
router.delete(
    '/rules/:id',
    authenticate,
    requirePermission(PERMISSIONS.DESTINATION_UPDATE),
    async (req: AuthRequest, res: Response) => {
        try {
            const id = req.params.id as string;

            await prisma.capacityRule.delete({
                where: { id },
            });

            logger.info(`Capacity rule deleted: ${id}`);

            res.json({
                success: true,
                message: 'Capacity rule deleted successfully',
            });
        } catch (error: any) {
            logger.error('Delete capacity rule error:', error);
            res.status(400).json({
                success: false,
                error: {
                    code: 'DELETE_FAILED',
                    message: error.message || 'Failed to delete capacity rule',
                },
            });
        }
    }
);


import { WeatherService } from '../services/WeatherService';
import { CapacityRecommendationEngine } from '../services/CapacityRecommendationEngine';

/**
 * GET /api/v1/capacity/operational-status/:destinationId
 * Get current operational status including weather and recommendations
 */
router.get(
    '/operational-status/:destinationId',
    authenticate,
    requirePermission(PERMISSIONS.DESTINATION_VIEW),
    async (req: AuthRequest, res: Response) => {
        try {
            const destinationId = req.params.destinationId as string;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 1. Get Live Weather
            const weather = await WeatherService.getInstance().getCurrentWeather(destinationId);

            // 2. Calculate Recommendation
            const recommendation = CapacityRecommendationEngine.calculateRecommendation(weather);

            // 3. Get Current DB Status (if decided)
            const dailyStatus = await prisma.dailyOperationalStatus.findUnique({
                where: {
                    destinationId_date: {
                        destinationId,
                        date: today
                    }
                },
                include: {
                    updatedBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                            role: true // Add role if relevant
                        }
                    }
                }
            });

            // 4. Get Destination Details (for base capacity)
            const destination = await prisma.destination.findUnique({
                where: { id: destinationId },
                select: { maxDailyCapacity: true, currentCapacity: true }
            });

            if (!destination) {
                return res.status(404).json({ success: false, message: 'Destination not found' });
            }

            // Determine Effective Capacity
            // If Admin made a decision, use it. Else, use Recommendation? No, SYSTEM SUGGESTS, ADMIN DECIDES.
            // If no decision, we show default Max Capacity but with the Recommendation Alert.
            // Or should we assume 'Normal' until decided?
            // The prompt says: "System = Suggests", "Admin = Decides".
            // So effective capacity is Base Capacity UNLESS dailyStatus exists.

            const effectiveCapacity = dailyStatus ? dailyStatus.effectiveCapacity : destination.maxDailyCapacity;

            // Calculate percentage based on EFFECTIVE capacity
            const currentLoad = Math.round((destination.currentCapacity / effectiveCapacity) * 100);

            return res.json({
                success: true,
                data: {
                    weather,
                    recommendation,
                    dailyStatus,
                    baseCapacity: destination.maxDailyCapacity,
                    effectiveCapacity,
                    currentLoad
                }
            });

        } catch (error: any) {
            logger.error('Get operational status error:', error);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'FETCH_FAILED',
                    message: error.message || 'Failed to fetch status',
                },
            });
        }
    }
);

/**
 * POST /api/v1/capacity/decide
 * Admin sets the daily operational capacity
 */
router.post(
    '/decide',
    authenticate,
    requirePermission(PERMISSIONS.CAPACITY_OVERRIDE), // Or a specific permission for daily decisions
    async (req: AuthRequest, res: Response) => {
        try {
            const { destinationId, status, effectiveCapacity, notes } = req.body;
            const userId = req.user!.userId;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Validation
            if (!destinationId || !status || effectiveCapacity === undefined) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            const destination = await prisma.destination.findUnique({
                where: { id: destinationId },
                select: { maxDailyCapacity: true }
            });

            if (!destination) return res.status(404).json({ success: false, message: 'Destination not found' });

            const dailyStatus = await prisma.dailyOperationalStatus.upsert({
                where: {
                    destinationId_date: {
                        destinationId,
                        date: today
                    }
                },
                update: {
                    status,
                    effectiveCapacity,
                    adminDecisionNotes: notes,
                    updatedById: userId
                },
                create: {
                    destinationId,
                    date: today,
                    status,
                    baseCapacity: destination.maxDailyCapacity,
                    effectiveCapacity,
                    adminDecisionNotes: notes,
                    updatedById: userId
                }
            });

            logger.info(`Daily operational status updated for ${destinationId}: ${status} (${effectiveCapacity})`);

            return res.json({
                success: true,
                data: dailyStatus,
                message: 'Operational decisions applied successfully'
            });

        } catch (error: any) {
            logger.error('Set operational status error:', error);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'UPDATE_FAILED',
                    message: error.message || 'Failed to update status',
                },
            });
        }
    }
);

export default router;
