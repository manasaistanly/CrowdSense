import { ActionPriority, ActionStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export class EscalationService {
    /**
     * Check for overdue orders and escalate priority
     * Should be run on a schedule (Cron Job)
     */
    async checkOverdueOrders() {
        try {
            const now = new Date();
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

            // 1. Find Critical/High orders pending for > 5 mins
            const overdueOrders = await prisma.actionOrder.findMany({
                where: {
                    status: ActionStatus.PENDING,
                    priority: { in: [ActionPriority.HIGH, ActionPriority.CRITICAL] },
                    createdAt: {
                        lt: fiveMinutesAgo
                    }
                }
            });

            if (overdueOrders.length === 0) return;

            logger.info(`Found ${overdueOrders.length} overdue orders. Escalating...`);

            // 2. Escalate
            for (const order of overdueOrders) {
                await prisma.actionOrder.update({
                    where: { id: order.id },
                    data: {
                        priority: ActionPriority.CRITICAL,
                        // Append to description or notes
                        description: `[ESCALATED at ${now.toLocaleTimeString()}] ` + order.description
                    }
                });

                // Simulate Notification
                // smsService.send(order.assignedToId, "URGENT: Order Overdue!");
            }
        } catch (error) {
            logger.error('Escalation Service Error:', error);
        }
    }
}

export const escalationService = new EscalationService();
