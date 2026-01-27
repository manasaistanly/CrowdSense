import express, { Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole, ActionStatus, ZoneStatus } from '@prisma/client';
import { actionOrderService } from '../services/actionOrder.service';
import { prisma } from '../config/database';

const router = express.Router();

/**
 * Create Action Order
 * Auth: SUPER_ADMIN, ZONE_ADMIN
 */
router.post(
    '/orders',
    authenticate,
    authorize([UserRole.SUPER_ADMIN, UserRole.ZONE_ADMIN]),
    async (req: AuthRequest, res: Response) => {
        try {
            const { title, description, zoneId, assignedToId, type, priority, locationLat, locationLng } = req.body;
            const createdById = req.user!.userId;

            const order = await actionOrderService.createOrder({
                title,
                description,
                zoneId,
                assignedToId,
                createdById,
                type,
                priority,
                locationLat,
                locationLng
            });

            res.status(201).json({ success: true, data: order });
        } catch (error: any) {
            console.error('Create Order Error:', error);
            res.status(400).json({
                success: false,
                error: {
                    code: 'CREATE_ORDER_FAILED',
                    message: error.message || 'Failed to create action order'
                }
            });
        }
    }
);

/**
 * Get Action Orders
 * Auth: All Roles (Ground staff needs to see their orders)
 */
router.get(
    '/orders',
    authenticate,
    async (req: AuthRequest, res: Response) => {
        try {
            const { status, zoneId } = req.query;
            const userId = req.user!.userId;
            const userRole = req.user!.role;

            const filters: any = {};
            if (status) filters.status = status as ActionStatus;
            if (zoneId) filters.zoneId = zoneId as string;

            // If user is Staff or Nodal Officer, mostly see their own orders unless filtered otherwise
            // For MVP, letting them see all orders for their zone might be useful fallback
            // But strict logic:
            if (userRole === UserRole.STAFF || userRole === UserRole.NODAL_OFFICER) {
                // By default, show assigned to them
                filters.userId = userId;
            }

            // Admins see all, or filtered by query

            const orders = await actionOrderService.getOrders(filters);
            res.json({ success: true, data: orders });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: {
                    code: 'FETCH_ORDERS_FAILED',
                    message: error.message
                }
            });
        }
    }
);

/**
 * Acknowledge Order
 * Auth: Assigned User
 */
router.patch(
    '/orders/:id/acknowledge',
    authenticate,
    async (req: AuthRequest, res: Response) => {
        try {
            const orderId = req.params.id;
            const userId = req.user!.userId;

            const order = await actionOrderService.acknowledgeOrder(orderId, userId);
            res.json({ success: true, data: order });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'ACKNOWLEDGE_FAILED',
                    message: error.message
                }
            });
        }
    }
);

/**
 * Complete Order
 * Auth: Assigned User
 */
router.patch(
    '/orders/:id/complete',
    authenticate,
    async (req: AuthRequest, res: Response) => {
        try {
            const orderId = req.params.id;
            const userId = req.user!.userId;
            const { proofImageUrl } = req.body;

            const order = await actionOrderService.completeOrder(orderId, userId, proofImageUrl);
            res.json({ success: true, data: order });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'COMPLETION_FAILED',
                    message: error.message
                }
            });
        }
    }
);

/**
 * Update Zone Health Status
 * Auth: SUPER_ADMIN, ZONE_ADMIN, NODAL_OFFICER
 */
router.put(
    '/zones/:id/status',
    authenticate,
    authorize([UserRole.SUPER_ADMIN, UserRole.ZONE_ADMIN, UserRole.NODAL_OFFICER]),
    async (req: AuthRequest, res: Response) => {
        try {
            const zoneId = req.params.id;
            const { status, healthIndex } = req.body;

            const zone = await prisma.zone.update({
                where: { id: zoneId },
                data: {
                    status: status as ZoneStatus,
                    healthIndex: healthIndex ? parseInt(healthIndex) : undefined
                }
            });

            res.json({ success: true, data: zone });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'ZONE_UPDATE_FAILED',
                    message: error.message
                }
            });
        }
    }
);

export default router;
