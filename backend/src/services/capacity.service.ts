
import { prisma } from '../config/database';

export class CapacityService {
    /**
     * Calculate the effective max capacity for a destination on a specific date,
     * considering all active capacity rules.
     */
    async calculateEffectiveCapacity(destinationId: string, date: Date): Promise<{
        capacity: number;
        appliedRule?: string;
    }> {
        // 1. Get base destination capacity
        const destination = await prisma.destination.findUnique({
            where: { id: destinationId },
            select: { maxDailyCapacity: true },
        });

        if (!destination) {
            throw new Error('Destination not found');
        }

        let effectiveCapacity = destination.maxDailyCapacity;
        let appliedRule = 'Base Capacity';

        // 2. Get active capacity rules
        const rules = await prisma.capacityRule.findMany({
            where: {
                destinationId,
                isActive: true,
            },
            orderBy: {
                priority: 'desc', // Higher priority rules take precedence
            },
        });

        // 3. Find the first matching rule
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ...
        // Normalize date to YYYY-MM-DD for comparison
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        for (const rule of rules) {
            let isMatch = true;

            // Check Date Range
            if (rule.startDate && rule.endDate) {
                const start = new Date(rule.startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(rule.endDate);
                end.setHours(23, 59, 59, 999);
                if (checkDate < start || checkDate > end) {
                    isMatch = false;
                }
            } else if (rule.startDate) {
                const start = new Date(rule.startDate);
                start.setHours(0, 0, 0, 0);
                if (checkDate < start) isMatch = false;
            } else if (rule.endDate) {
                const end = new Date(rule.endDate);
                end.setHours(23, 59, 59, 999);
                if (checkDate > end) isMatch = false;
            }

            // Check Applicable Days (Array of Ints [0-6])
            if (isMatch && rule.applicableDays && rule.applicableDays.length > 0) {
                if (!rule.applicableDays.includes(dayOfWeek)) {
                    isMatch = false;
                }
            }

            // If rule matches, apply it and break (since we ordered by priority)
            if (isMatch) {
                if (rule.absoluteCapacity !== null) {
                    effectiveCapacity = rule.absoluteCapacity;
                } else if (rule.capacityPercentage !== null) {
                    effectiveCapacity = Math.floor(destination.maxDailyCapacity * (Number(rule.capacityPercentage) / 100)); // Assuming percentage is like 80 for 80% or 0.8? Schema says Decimal(5,2), usually 80.00
                    // Let's assume user enters "80" for 80%. If it's 0.8, we'd need to check. 
                    // Usually percentages in UI are 0-100.
                    // The schema says Decimal(5,2). 
                }

                // Correction: Using the percentage value directly.
                // If it's < 1, it might be a fraction. But "capacityPercentage" implies % value.
                // Safest to treat as percentage if > 1. If <= 1, might be fraction.
                // Let's assume it is 0-100 based on standard naming.

                // If using Prisma Decimal, we need to convert to number.

                if (rule.capacityPercentage !== null && rule.absoluteCapacity === null) {
                    const pct = Number(rule.capacityPercentage);
                    // Heuristic: if <= 1, treat as fraction (e.g. 0.8). If > 1, treat as percent (e.g. 80).
                    const multiplier = pct <= 1 ? pct : pct / 100;
                    effectiveCapacity = Math.floor(destination.maxDailyCapacity * multiplier);
                }

                appliedRule = rule.ruleName;
                break; // Stop at first high-priority match
            }
        }

        return { capacity: effectiveCapacity, appliedRule };
    }

    /**
     * Check if there is enough availability for a specific booking request.
     * Checks both Destination-level (effective) capacity and Zone-level capacity if applicable.
     */
    async checkAvailability(
        destinationId: string,
        date: Date,
        visitors: number,
        zoneId?: string
    ): Promise<{
        isAvailable: boolean;
        reason?: string;
        availableSlots: number;
    }> {
        // 1. Check Destination-Level Capacity
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0); // Start of day
        const nextDay = new Date(checkDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const { capacity: maxCapacity, appliedRule } = await this.calculateEffectiveCapacity(destinationId, date);


        const destinationVisitorCountAgg = await prisma.booking.aggregate({
            where: {
                destinationId,
                visitDate: {
                    gte: checkDate,
                    lt: nextDay,
                },
                status: {
                    in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'],
                },
            },
            _sum: {
                numberOfVisitors: true,
            },
        });

        const currentVisitors = destinationVisitorCountAgg._sum.numberOfVisitors || 0;
        const availableDestinationSlots = maxCapacity - currentVisitors;

        if (availableDestinationSlots < visitors) {
            return {
                isAvailable: false,
                reason: `Destination capacity exceeded${appliedRule !== 'Base Capacity' ? ` (Rule: ${appliedRule})` : ''}`,
                availableSlots: availableDestinationSlots
            };
        }

        // 2. Check Zone-Level Capacity (if zoneId provided)
        let availableZoneSlots = availableDestinationSlots; // Default to destination availability if no zone

        if (zoneId) {
            const zone = await prisma.zone.findUnique({
                where: { id: zoneId },
                select: { maxCapacity: true, name: true },
            });

            if (!zone) throw new Error('Zone not found');

            const zoneVisitorCountAgg = await prisma.booking.aggregate({
                where: {
                    destinationId,
                    zoneId, // Filter by zone
                    visitDate: {
                        gte: checkDate,
                        lt: nextDay,
                    },
                    status: {
                        in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'],
                    },
                },
                _sum: {
                    numberOfVisitors: true,
                },
            });

            const currentZoneVisitors = zoneVisitorCountAgg._sum.numberOfVisitors || 0;
            availableZoneSlots = zone.maxCapacity - currentZoneVisitors;

            if (availableZoneSlots < visitors) {
                return {
                    isAvailable: false,
                    reason: `Zone '${zone.name}' capacity exceeded`,
                    availableSlots: availableZoneSlots
                };
            }
        }

        // Return the more restrictive of the two
        return {
            isAvailable: true,
            availableSlots: Math.min(availableDestinationSlots, availableZoneSlots)
        };
    }
}

export const capacityService = new CapacityService();
