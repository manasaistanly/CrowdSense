import { prisma } from '../config/database';

export class PricingService {
    /**
     * Calculate dynamic price based on demand and rules
     */
    async calculatePrice(
        destinationId: string,
        visitDate: Date,
        numberOfVisitors: number,
        visitorDetails?: any[]
    ) {
        // 1. Get Destination & Pricing Rules
        const destination = await prisma.destination.findUnique({
            where: { id: destinationId },
            include: {
                pricingRules: {
                    where: { isActive: true },
                    orderBy: { priority: 'desc' },
                    take: 1,
                },
            },
        });

        if (!destination) {
            throw new Error('Destination not found');
        }

        const baseRule = destination.pricingRules[0];
        const basePrice = baseRule ? Number(baseRule.basePrice) : 100;

        let surgeMultiplier = 1.0;
        let reasons: string[] = [];

        // 2. Check Capacity (Demand Surge)
        // Count confirmed bookings for that date
        const bookings = await prisma.booking.findMany({
            where: {
                destinationId,
                visitDate: visitDate,
                status: { in: ['CONFIRMED', 'CHECKED_IN'] }
            }
        });

        const bookedCount = bookings.reduce((sum: number, b: any) => sum + b.numberOfVisitors, 0);
        const capacityPercentage = (bookedCount / destination.maxDailyCapacity) * 100;

        if (capacityPercentage >= 90) {
            surgeMultiplier += (baseRule ? Number(baseRule.peakMultiplier) - 1 : 0.20);
            reasons.push(`High Demand Surge (${Math.round((surgeMultiplier - 1) * 100)}%)`);
        } else if (capacityPercentage >= 70) {
            // If we had a mid-tier rule, we could use it. For now, half the peak surge or standard 10%
            surgeMultiplier += (baseRule ? (Number(baseRule.peakMultiplier) - 1) / 2 : 0.10);
            reasons.push('Moderate Demand Surge');
        } else if (capacityPercentage < 30 && baseRule && Number(baseRule.offPeakMultiplier) < 1) {
            // Off-peak discount
            surgeMultiplier = Number(baseRule.offPeakMultiplier);
            reasons.push(`Off-Peak Discount (${Math.round((1 - surgeMultiplier) * 100)}%)`);
        }

        // 3. Check Day of Week (Weekend Surge) - If not already covered by rule specific days
        const dayOfWeek = visitDate.getDay(); // 0 = Sunday, 6 = Saturday
        if ((dayOfWeek === 0 || dayOfWeek === 6) && surgeMultiplier === 1.0) {
            // Only apply generic weekend surge if no other surge applied, OR if rule specifies it?
            // Simplification: If rule is specific to weekends, basePrice already reflects it.
            // If generic rule, maybe add small surge.
            // For now, let's trust the Base Price + Peak Multiplier logic predominantly.
            // But if no rule exists, keep the hardcoded logic.
            if (!baseRule) {
                surgeMultiplier += 0.15;
                reasons.push('Weekend Rate (+15%)');
            }
        }

        // 4. Calculate Total Price with Categories
        let totalPrice = 0;

        if (visitorDetails && Array.isArray(visitorDetails) && baseRule) {
            // Calculate per visitor type
            visitorDetails.forEach(visitor => {
                let p = Number(baseRule.basePrice);
                if (visitor.type === 'child' && baseRule.childPrice) p = Number(baseRule.childPrice);
                else if (visitor.type === 'adult' && baseRule.adultPrice) p = Number(baseRule.adultPrice);
                else if (visitor.type === 'local' && baseRule.localPrice) p = Number(baseRule.localPrice);
                else if (visitor.type === 'foreigner' && baseRule.foreignPrice) p = Number(baseRule.foreignPrice);

                totalPrice += p;
            });
        } else {
            // Default calculation
            totalPrice = basePrice * numberOfVisitors;
        }

        // Apply Surge
        const finalTotalPrice = Math.round(totalPrice * surgeMultiplier);
        const avgPricePerPerson = Math.round(finalTotalPrice / numberOfVisitors);

        return {
            basePrice,
            finalPricePerPerson: avgPricePerPerson,
            totalPrice: finalTotalPrice,
            surgeMultiplier,
            reasons,
            breakdown: {
                base: totalPrice,
                surge: finalTotalPrice - totalPrice
            }
        };
    }
}

export const pricingService = new PricingService();
