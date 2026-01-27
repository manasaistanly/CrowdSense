import { Prisma, ActionStatus, ActionType, ActionPriority } from '@prisma/client';
import { prisma } from '../config/database';

export class ActionOrderService {
    /**
     * Create a new Action Order
     */
    async createOrder(data: {
        title: string;
        description: string;
        zoneId: string;
        assignedToId: string;
        createdById: string;
        type: ActionType;
        priority: ActionPriority;
        expiresAt?: Date;
        locationLat?: number;
        locationLng?: number;
    }) {
        const order = await prisma.actionOrder.create({
            data: {
                title: data.title,
                description: data.description,
                zoneId: data.zoneId,
                assignedToId: data.assignedToId,
                createdById: data.createdById,
                type: data.type,
                priority: data.priority,
                expiresAt: data.expiresAt,
                locationLat: data.locationLat,
                locationLng: data.locationLng,
                status: 'PENDING',
            },
            include: {
                zone: true,
                assignedTo: {
                    select: { id: true, firstName: true, lastName: true, role: true }
                },
                createdBy: {
                    select: { id: true, firstName: true, lastName: true }
                }
            }
        });
        return order;
    }

    /**
     * Acknowledge an Order (Digital Handshake)
     */
    async acknowledgeOrder(orderId: string, userId: string) {
        const order = await prisma.actionOrder.findUnique({ where: { id: orderId } });

        if (!order) throw new Error('Order not found');
        if (order.assignedToId !== userId) throw new Error('Unauthorized to acknowledge this order');
        if (order.status !== 'PENDING') throw new Error('Order is not in PENDING state');

        return await prisma.actionOrder.update({
            where: { id: orderId },
            data: {
                status: 'ACKNOWLEDGED',
                acknowledgedAt: new Date(),
            }
        });
    }

    /**
     * Complete an Order
     */
    async completeOrder(
        orderId: string,
        userId: string,
        proofImageUrl?: string,
        completedLat?: number,
        completedLng?: number
    ) {
        const order = await prisma.actionOrder.findUnique({ where: { id: orderId } });

        if (!order) throw new Error('Order not found');
        if (order.assignedToId !== userId) throw new Error('Unauthorized to complete this order');

        // Verify Location (Anti-Spoofing)
        let note = '';
        if (order.locationLat && order.locationLng && completedLat && completedLng) {
            const distance = this.calculateDistance(
                Number(order.locationLat), Number(order.locationLng),
                completedLat, completedLng
            );

            // 100 meters tolerance
            if (distance > 0.1) {
                note = `LOCATION WARNING: Completed ${Math.round(distance * 1000)}m away from target.`;
                console.warn(`Order ${orderId}: ${note}`);
            } else {
                note = 'Location Verified';
            }
        }

        return await prisma.actionOrder.update({
            where: { id: orderId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                proofImageUrl: proofImageUrl,
                // notes: note ? note : undefined // 'notes' field might be missing in schema, skipping for now
            }
        });
    }

    /**
     * Haversine Distance in KM
     */
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    /**
     * Get Orders (with filters)
     */
    async getOrders(params: {
        userId?: string; // If provided, fetches orders assigned to this user
        zoneId?: string; // If provided, fetches orders for this zone
        status?: ActionStatus;
        createdById?: string;
    }) {
        const where: Prisma.ActionOrderWhereInput = {};

        if (params.userId) where.assignedToId = params.userId;
        if (params.zoneId) where.zoneId = params.zoneId;
        if (params.status) where.status = params.status;
        if (params.createdById) where.createdById = params.createdById;

        return await prisma.actionOrder.findMany({
            where,
            include: {
                zone: { select: { id: true, name: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}

export const actionOrderService = new ActionOrderService();
