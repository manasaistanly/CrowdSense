import express, { Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole, ZoneStatus, ActionStatus } from '@prisma/client';
import { prisma } from '../config/database';

const router = express.Router();

/**
 * Get War Room Dashboard Data
 * Auth: SUPER_ADMIN, ZONE_ADMIN
 */
router.get(
    '/war-room',
    authenticate,
    authorize([UserRole.SUPER_ADMIN, UserRole.ZONE_ADMIN]),
    async (req: AuthRequest, res: Response) => {
        try {
            // 1. Zone Health Overview
            const zones = await prisma.zone.findMany({
                select: {
                    id: true,
                    name: true,
                    status: true,
                    healthIndex: true,
                    currentCapacity: true,
                    maxCapacity: true
                },
                orderBy: { healthIndex: 'desc' } // Critical zones first
            });

            const criticalZones = zones.filter(z => z.status === ZoneStatus.RED);

            // 2. Action Order Overview
            const pendingOrders = await prisma.actionOrder.count({
                where: { status: ActionStatus.PENDING }
            });

            const overdueOrders = await prisma.actionOrder.count({
                where: { status: ActionStatus.PENDING, priority: 'CRITICAL' } // Approximate "Overdue" query
            });

            // 3. Officer Status (Active/Idle) - Mocked for now based on recent activity
            // simplistic: count of users with role STAFF
            const totalStaff = await prisma.user.count({
                where: { role: UserRole.STAFF }
            });

            res.json({
                success: true,
                data: {
                    overview: {
                        criticalZones: criticalZones.length,
                        totalVisitors: zones.reduce((sum, z) => sum + z.currentCapacity, 0),
                        pendingOrders,
                        overdueOrders,
                        activeStaff: totalStaff
                    },
                    zones: zones,
                    alerts: criticalZones.map(z => ({
                        type: 'CRITICAL_ZONE',
                        message: `Zone ${z.name} is at ${z.healthIndex}% capacity!`
                    }))
                }
            });

        } catch (error: any) {
            console.error('War Room Error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'ANALYTICS_FAILED',
                    message: error.message
                }
            });
        }
    }
);

export default router;
